import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/user-store';
import { analyticsEventBus, AnalyticsEventType } from './analytics-event-bus';

// Types
interface PlayContext {
  source: 'direct' | 'playlist' | 'autoplay' | 'embedded' | 'share';
  deviceType?: string;
  platform?: string;
  sessionId?: string;
  referrer?: string;
  playlistId?: string;
  playerType: 'main' | 'embedded' | 'mini';
}

interface GeoData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  connectionType?: string;
  networkProvider?: string;
}

interface ErrorContext {
  stackTrace?: string;
  component?: string;
  [key: string]: any;
}

interface SubscriptionData {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  startDate: string;
  endDate: string;
  isTrial: boolean;
  paymentMethod: string;
}

interface RevenueMetadata {
  currency?: string;
  transactionId?: string;
  paymentMethod?: string;
  recipientId?: string;
  source?: string;
  [key: string]: any;
}

// Generate a unique session ID
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get URL parameter by name (for web)
const getParameterByName = (name: string): string | null => {
  if (Platform.OS !== 'web') return null;
  
  const url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  
  if (!results) return null;
  if (!results[2]) return '';
  
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Get current session ID
const getCurrentSessionId = async (): Promise<string> => {
  let sessionId = await AsyncStorage.getItem('current_session_id');
  
  if (!sessionId) {
    sessionId = generateUniqueId();
    await AsyncStorage.setItem('current_session_id', sessionId);
    await AsyncStorage.setItem('session_start_time', Date.now().toString());
  }
  
  return sessionId;
};

// Determine connection type (basic implementation)
const determineConnectionType = (): string => {
  if (Platform.OS === 'web') {
    // Use type guard to check for connection property
    // @ts-ignore - navigator.connection is not in the type definitions but exists in some browsers
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      return connection.effectiveType || 'unknown';
    }
  }
  return 'unknown';
};

// Analytics class
class Analytics {
  private initialized: boolean = false;
  private sessionId: string = '';
  private consentGranted: boolean = false;
  private userGenrePreferences: Record<string, number> = {};
  private genreListeningTime: Record<string, number> = {};
  private eventBusUnsubscribe: (() => void) | null = null;
  
  // Initialize analytics
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Check for consent
    const consentStatus = await AsyncStorage.getItem('analytics_consent');
    this.consentGranted = consentStatus === 'granted';
    
    // Generate session ID
    this.sessionId = await getCurrentSessionId();
    
    // Set debug mode in event bus
    analyticsEventBus.setDebugMode(__DEV__);
    
    // Subscribe to all events from the event bus
    this.eventBusUnsubscribe = analyticsEventBus.subscribeToType('*', (eventName, eventData) => {
      if (this.consentGranted) {
        this.processEventBusEvent({ type: eventName as AnalyticsEventType, properties: eventData, timestamp: Date.now() });
      }
    });
    
    // Track session start
    if (this.consentGranted) {
      this.trackSessionStart();
    }
    
    this.initialized = true;
    
    // Set up ping to track session duration
    setInterval(() => this.pingSession(), 60000);
    
    // Load user genre preferences
    this.loadUserGenrePreferences();
    
    // Update user ID in event bus when user logs in/out
    this.updateEventBusUserId();
  }
  
  // Update user ID in event bus
  private updateEventBusUserId(): void {
    const userId = useUserStore.getState().currentUser?.id || null;
    analyticsEventBus.setUserId(userId);
  }
  
  // Process events from the event bus
  private processEventBusEvent(event: any): void {
    // Add common properties
    const eventData = {
      ...event.properties,
      timestamp: new Date(event.timestamp).toISOString(),
      session_id: this.sessionId,
      platform: Platform.OS,
      app_version: '1.0.0', // Should come from app config
      device_info: this.getDeviceInfo(),
    };
    
    // Send to analytics service
    this.sendToAnalyticsService(event.type, eventData);
    
    // Log in development
    if (__DEV__) {
      console.log(`[Analytics] ${event.type}:`, eventData);
    }
  }
  
  // Load user genre preferences
  private async loadUserGenrePreferences(): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id;
    if (!userId) return;
    
    try {
      const prefsString = await AsyncStorage.getItem(`genre_preferences_${userId}`);
      if (prefsString) {
        this.userGenrePreferences = JSON.parse(prefsString);
      }
      
      const timeString = await AsyncStorage.getItem(`genre_time_${userId}`);
      if (timeString) {
        this.genreListeningTime = JSON.parse(timeString);
      }
    } catch (error) {
      console.error('Error loading genre preferences:', error);
    }
  }
  
  // Track genre preference
  async trackGenrePreference(track: any, duration: number): Promise<void> {
    if (!track || !track.genres || !track.genres.length) return;
    
    const userId = useUserStore.getState().currentUser?.id;
    if (!userId) return;
    
    // Create a map of time spent on each genre
    const updatedGenreTime = { ...this.genreListeningTime };
    
    track.genres.forEach((genre: string) => {
      if (!updatedGenreTime[genre]) {
        updatedGenreTime[genre] = 0;
      }
      updatedGenreTime[genre] += duration;
    });
    
    this.genreListeningTime = updatedGenreTime;
    
    // Calculate genre preferences as percentages
    const totalTime = Object.values(updatedGenreTime).reduce((sum, time) => sum + time, 0);
    
    const preferences: Record<string, number> = {};
    Object.keys(updatedGenreTime).forEach(genre => {
      preferences[genre] = (updatedGenreTime[genre] / totalTime) * 100;
    });
    
    this.userGenrePreferences = preferences;
    
    // Save to AsyncStorage (throttled to prevent excessive writes)
    this.saveGenrePreferences(userId, preferences, updatedGenreTime);
    
    // Publish to event bus
    analyticsEventBus.publish('custom_event', {
      category: 'genre_preference',
      user_id: userId,
      genres: track.genres,
      duration,
      preferences
    });
  }
  
  // Save genre preferences (debounced)
  private saveGenrePreferencesTimeout: NodeJS.Timeout | null = null;
  private saveGenrePreferences(
    userId: string, 
    preferences: Record<string, number>,
    timeData: Record<string, number>
  ): void {
    if (this.saveGenrePreferencesTimeout) {
      clearTimeout(this.saveGenrePreferencesTimeout);
    }
    
    this.saveGenrePreferencesTimeout = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(`genre_preferences_${userId}`, JSON.stringify(preferences));
        await AsyncStorage.setItem(`genre_time_${userId}`, JSON.stringify(timeData));
      } catch (error) {
        console.error('Error saving genre preferences:', error);
      }
    }, 30000); // Only update every 30 seconds at most
  }
  
  // Track event (main method)
  async track(eventName: AnalyticsEventType, properties: Record<string, any> = {}): Promise<void> {
    if (!this.initialized) await this.initialize();
    if (!this.consentGranted) return;
    
    // Publish to event bus
    analyticsEventBus.publish(eventName, properties);
  }
  
  // Track session start
  private async trackSessionStart(): Promise<void> {
    const referringSource = Platform.OS === 'web' ? document.referrer : 'app_launch';
    const landingPage = Platform.OS === 'web' ? window.location.pathname : 'app_home';
    
    await this.track('custom_event', {
      category: 'session',
      action: 'start',
      referring_source: referringSource,
      landing_page: landingPage,
      utm_source: getParameterByName('utm_source'),
      utm_medium: getParameterByName('utm_medium'),
      utm_campaign: getParameterByName('utm_campaign'),
    });
    
    // Initialize geo tracking
    this.initializeGeoTracking();
  }
  
  // Ping to keep session alive and track duration
  private async pingSession(): Promise<void> {
    if (!this.consentGranted) return;
    
    const sessionStartTime = await AsyncStorage.getItem('session_start_time');
    if (!sessionStartTime) return;
    
    const startTime = parseInt(sessionStartTime, 10);
    const currentTime = Date.now();
    const sessionDuration = Math.floor((currentTime - startTime) / 1000); // in seconds
    
    await this.track('custom_event', {
      category: 'session',
      action: 'ping',
      duration_seconds: sessionDuration,
      current_screen: Platform.OS === 'web' ? window.location.pathname : 'unknown',
    });
  }
  
  // Track play event
  async trackPlay(trackId: string, context: Partial<PlayContext> = {}): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id || 'anonymous';
    
    const defaultContext: PlayContext = {
      source: 'direct',
      deviceType: this.getDeviceType(),
      platform: Platform.OS,
      sessionId: this.sessionId,
      playerType: 'main',
    };
    
    const playContext = { ...defaultContext, ...context };
    
    await this.track('track_play', {
      track_id: trackId,
      user_id: userId,
      ...playContext,
    });
    
    // Start monitoring play progress
    this.startPlayProgressTracking(trackId, userId);
  }
  
  // Track play completion
  async trackPlayCompletion(
    trackId: string, 
    percentCompleted: number, 
    durationListened: number
  ): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id || 'anonymous';
    
    let playType = 'partial_play';
    
    if (percentCompleted >= 0.9) {
      playType = 'complete_play';
    } else if (percentCompleted < 0.3) {
      playType = 'brief_play';
    }
    
    await this.track('track_complete', {
      track_id: trackId,
      user_id: userId,
      play_type: playType,
      percent_completed: percentCompleted,
      duration_listened: durationListened,
    });
  }
  
  // Start tracking play progress
  private startPlayProgressTracking(trackId: string, userId: string): void {
    // In a real implementation, this would set up listeners to track
    // how much of the track was played before stopping/skipping
    // For now, we'll just simulate this with a timeout
    
    // This is just a placeholder - real implementation would be more complex
    setTimeout(() => {
      // Simulate a play that reached 85% completion
      this.trackPlayCompletion(trackId, 0.85, 180);
    }, 5000);
  }
  
  // Track user geographic data
  async trackUserGeographicData(geoData: GeoData): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id;
    if (!userId) return;
    
    await this.track('custom_event', {
      category: 'geo_data',
      user_id: userId,
      ...geoData,
    });
  }
  
  // Initialize geo tracking
  private async initializeGeoTracking(): Promise<void> {
    // In a real app, you would use a service like ipinfo.io or maxmind
    // For this demo, we'll just use mock data
    
    const mockGeoData: GeoData = {
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      postalCode: '94105',
      latitude: 37.7749,
      longitude: -122.4194,
      connectionType: determineConnectionType(),
      networkProvider: 'Mock ISP',
    };
    
    // Store geo data
    await AsyncStorage.setItem('geo_data', JSON.stringify(mockGeoData));
    
    // Track geo data if user is logged in
    const userId = useUserStore.getState().currentUser?.id;
    if (userId) {
      await this.trackUserGeographicData(mockGeoData);
    }
  }
  
  // Track user engagement
  async trackEngagement(
    actionType: string, 
    entityId: string, 
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id || 'anonymous';
    
    await this.track('custom_event', {
      category: 'engagement',
      action_type: actionType, // 'like', 'comment', 'share', etc.
      entity_type: metadata.entityType || 'track', // 'track', 'playlist', 'profile', etc.
      entity_id: entityId,
      user_id: userId,
      metadata: JSON.stringify(metadata),
    });
  }
  
  // Track page/view performance
  async trackPagePerformance(): Promise<void> {
    if (Platform.OS !== 'web' || !window.performance || !window.performance.timing) {
      return;
    }
    
    const timing = window.performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domReadyTime = timing.domComplete - timing.domLoading;
    
    await this.track('performance_metric', {
      page_url: window.location.href,
      page_load_time: pageLoadTime,
      dom_ready_time: domReadyTime,
      time_to_interactive: timing.domInteractive - timing.navigationStart,
      dns_time: timing.domainLookupEnd - timing.domainLookupStart,
      tcp_connect_time: timing.connectEnd - timing.connectStart,
      response_time: timing.responseEnd - timing.responseStart,
    });
  }
  
  // Track app errors
  async trackError(
    errorType: string, 
    errorMessage: string, 
    errorContext: ErrorContext = {}
  ): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id || 'anonymous';
    
    await this.track('api_error', {
      user_id: userId,
      error_type: errorType,
      error_message: errorMessage,
      page_url: Platform.OS === 'web' ? window.location.href : 'app',
      browser: Platform.OS === 'web' ? navigator.userAgent : Platform.OS,
      stack_trace: errorContext.stackTrace || null,
      component: errorContext.component || null,
      additional_context: JSON.stringify(errorContext),
    });
  }
  
  // Track subscription events
  async trackSubscriptionEvent(
    eventType: string, 
    subscriptionData: SubscriptionData
  ): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id;
    if (!userId) return;
    
    await this.track('custom_event', {
      category: 'subscription',
      event_type: eventType, // 'created', 'upgraded', 'downgraded', 'cancelled', 'renewed'
      user_id: userId,
      subscription_id: subscriptionData.id,
      plan_id: subscriptionData.planId,
      plan_name: subscriptionData.planName,
      amount: subscriptionData.amount,
      currency: subscriptionData.currency,
      billing_period: subscriptionData.billingPeriod,
      start_date: subscriptionData.startDate,
      end_date: subscriptionData.endDate,
      is_trial: subscriptionData.isTrial,
      payment_method: subscriptionData.paymentMethod,
    });
  }
  
  // Track revenue events
  async trackRevenueEvent(
    eventType: string, 
    amount: number, 
    metadata: RevenueMetadata = {}
  ): Promise<void> {
    const userId = useUserStore.getState().currentUser?.id;
    if (!userId) return;
    
    await this.track('custom_event', {
      category: 'revenue',
      event_type: eventType, // 'donation', 'royalty_payment', 'subscription_payment', etc.
      user_id: userId,
      amount: amount,
      currency: metadata.currency || 'USD',
      transaction_id: metadata.transactionId,
      payment_method: metadata.paymentMethod,
      recipient_id: metadata.recipientId,
      source: metadata.source,
    });
  }
  
  // Set tracking consent
  async setTrackingConsent(isGranted: boolean): Promise<void> {
    await AsyncStorage.setItem('analytics_consent', isGranted ? 'granted' : 'denied');
    this.consentGranted = isGranted;
    
    if (isGranted && !this.initialized) {
      await this.initialize();
    }
    
    // Track consent change
    if (this.initialized && isGranted) {
      await this.track('custom_event', {
        category: 'privacy',
        action: 'consent_granted'
      });
    }
  }
  
  // Handle data deletion request
  async handleDataDeletionRequest(userId: string): Promise<void> {
    // In a real app, this would call APIs to delete user data from analytics services
    console.log(`[Analytics] Deletion request for user: ${userId}`);
    
    // For this demo, we'll just log it
    await this.track('custom_event', {
      category: 'privacy',
      action: 'data_deletion_request',
      user_id: userId,
    });
    
    // Clear local storage for this user
    await AsyncStorage.removeItem(`genre_preferences_${userId}`);
    await AsyncStorage.removeItem(`genre_time_${userId}`);
  }
  
  // Helper methods
  private getDeviceInfo(): Record<string, any> {
    if (Platform.OS === 'web') {
      return {
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        language: navigator.language,
      };
    }
    
    return {
      device_type: this.getDeviceType(),
      platform: Platform.OS,
    };
  }
  
  private getDeviceType(): string {
    // Simple device type detection
    if (Platform.OS === 'web') {
      const userAgent = navigator.userAgent;
      if (/Mobi|Android/i.test(userAgent)) {
        return 'mobile';
      }
      if (/iPad|Tablet/i.test(userAgent)) {
        return 'tablet';
      }
      return 'desktop';
    }
    
    // For native platforms
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Could use Dimensions to determine if tablet or phone
      return 'mobile';
    }
    
    return 'unknown';
  }
  
  // Send to analytics service (mock implementation)
  private sendToAnalyticsService(eventName: string, eventData: Record<string, any>): void {
    // In a real app, this would send data to Google Analytics, Mixpanel, etc.
    // For this demo, we'll just log it
    if (__DEV__) {
      console.log(`[Analytics Service] ${eventName}:`, eventData);
    }
    
    // In a real implementation, you would have code like:
    // if (Platform.OS === 'web') {
    //   // Send to Google Analytics
    //   gtag('event', eventName, eventData);
    //   
    //   // Send to Mixpanel
    //   mixpanel.track(eventName, eventData);
    // } else {
    //   // Send to mobile analytics SDK
    //   analyticsSDK.logEvent(eventName, eventData);
    // }
  }
  
  // Clean up resources
  cleanup(): void {
    if (this.eventBusUnsubscribe) {
      this.eventBusUnsubscribe();
      this.eventBusUnsubscribe = null;
    }
    
    if (this.saveGenrePreferencesTimeout) {
      clearTimeout(this.saveGenrePreferencesTimeout);
    }
  }
}

// Create and export singleton instance
export const analytics = new Analytics();

// Initialize analytics on import
analytics.initialize().catch(error => {
  console.error('[Analytics] Initialization error:', error);
});

// Export helper functions for easy use throughout the app
export const trackScreenView = async (screenName: string): Promise<void> => {
  await analytics.track('screen_view', { screen_name: screenName });
};

export const trackButtonClick = async (buttonName: string, screenName: string): Promise<void> => {
  await analytics.track('custom_event', { 
    category: 'ui_interaction',
    action: 'button_click',
    button_name: buttonName, 
    screen_name: screenName 
  });
};

export const trackSearch = async (query: string, resultCount: number): Promise<void> => {
  await analytics.track('search_query', { query, result_count: resultCount });
};

export const trackError = async (
  errorType: string, 
  errorMessage: string, 
  context: ErrorContext = {}
): Promise<void> => {
  await analytics.trackError(errorType, errorMessage, context);
};

// Set up global error handler
if (Platform.OS === 'web') {
  window.addEventListener('error', (event) => {
    analytics.trackError('unhandled_error', event.message, {
      stackTrace: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}