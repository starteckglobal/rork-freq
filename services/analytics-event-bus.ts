// A simple event bus for analytics events
// This allows components to publish analytics events without directly depending on the analytics service

export type AnalyticsEventType = 
  | 'screen_view'
  | 'user_login'
  | 'user_logout'
  | 'user_profile_update'
  | 'user_follow'
  | 'user_unfollow'
  | 'track_play'
  | 'track_complete'
  | 'track_like'
  | 'track_unlike'
  | 'track_add_to_playlist'
  | 'track_added_to_playlist'
  | 'track_remove_from_playlist'
  | 'track_removed_from_playlist'
  | 'track_pause'
  | 'track_seek'
  | 'track_skip'
  | 'track_share'
  | 'track_uploaded'
  | 'playlist_create'
  | 'playlist_update'
  | 'playlist_like'
  | 'playlist_unlike'
  | 'search_query'
  | 'search_result_click'
  | 'search_filter_apply'
  | 'search_no_results'
  | 'api_error'
  | 'feature_use'
  | 'state_change'
  | 'performance_metric'
  | 'custom_event'
  | 'tab_change'
  | 'user_registration'
  | 'settings_updated'
  | 'security_updated'
  | 'account_deleted'
  | 'data_exported'
  | 'cache_cleared'
  | 'privacy_setting_changed'
  | 'playback_setting_changed'
  | 'analytics_time_range_changed';

interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  properties: Record<string, any>;
  userId?: string | null;
}

type EventCallback = (event: AnalyticsEvent) => void;
type EventTypeCallback = (eventName: string, eventData: any) => void;

class AnalyticsEventBus {
  private subscribers: EventCallback[] = [];
  private typeSubscribers: Record<string, EventTypeCallback[]> = {};
  private userId: string | null = null;
  private debugMode: boolean = false;

  // Set user ID for events
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  // Set debug mode
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  // Subscribe to all analytics events
  subscribe(callback: EventCallback): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Subscribe to a specific event type
  subscribeToType(eventType: string, callback: EventTypeCallback): () => void {
    if (!this.typeSubscribers[eventType]) {
      this.typeSubscribers[eventType] = [];
    }
    
    this.typeSubscribers[eventType].push(callback);
    
    // Return unsubscribe function
    return () => {
      if (this.typeSubscribers[eventType]) {
        this.typeSubscribers[eventType] = this.typeSubscribers[eventType].filter(cb => cb !== callback);
      }
    };
  }

  // Publish an analytics event
  publish(eventType: AnalyticsEventType, eventData: any = {}): void {
    const event: AnalyticsEvent = {
      type: eventType,
      timestamp: Date.now(),
      properties: eventData,
      userId: this.userId
    };

    // Log in debug mode
    if (this.debugMode) {
      console.log(`[Analytics Event] ${eventType}:`, eventData);
    }

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in analytics event subscriber:', error);
      }
    });
    
    // Notify type-specific subscribers
    if (this.typeSubscribers[eventType]) {
      this.typeSubscribers[eventType].forEach(callback => {
        try {
          callback(eventType, eventData);
        } catch (error) {
          console.error(`Error in analytics event subscriber for ${eventType}:`, error);
        }
      });
    }
    
    // Notify wildcard subscribers
    if (this.typeSubscribers['*']) {
      this.typeSubscribers['*'].forEach(callback => {
        try {
          callback(eventType, eventData);
        } catch (error) {
          console.error('Error in wildcard analytics event subscriber:', error);
        }
      });
    }
  }
}

// Create a singleton instance
export const analyticsEventBus = new AnalyticsEventBus();