import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'expo-router';
import { analytics, trackScreenView } from '@/services/analytics';
import { analyticsEventBus, AnalyticsEventType } from '@/services/analytics-event-bus';
import { Platform } from 'react-native';

/**
 * Hook to track screen views and other analytics events
 */
export function useAnalytics() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  
  // Track screen view when pathname changes
  useEffect(() => {
    if (pathname && pathname !== previousPathname.current) {
      // Convert pathname to screen name
      // e.g., "/track/123" -> "TrackDetails"
      const screenName = getScreenNameFromPath(pathname);
      
      // Track screen view
      trackScreenView(screenName);
      
      // Update previous pathname
      previousPathname.current = pathname;
    }
  }, [pathname]);
  
  // Track performance metrics on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Wait for page to fully load
      window.addEventListener('load', () => {
        setTimeout(() => {
          analytics.trackPagePerformance();
        }, 0);
      });
    }
    
    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('load', () => {});
      }
    };
  }, []);
  
  // Create tracking functions
  const trackEvent = useCallback((eventType: AnalyticsEventType, properties: Record<string, any> = {}) => {
    analytics.track(eventType, properties);
  }, []);
  
  const trackEngagement = useCallback((actionType: string, entityId: string, metadata: Record<string, any> = {}) => {
    analytics.trackEngagement(actionType, entityId, metadata);
  }, []);
  
  const trackPlay = useCallback((trackId: string, context: Record<string, any> = {}) => {
    analytics.trackPlay(trackId, context);
  }, []);
  
  const trackError = useCallback((errorType: string, errorMessage: string, context: Record<string, any> = {}) => {
    analytics.trackError(errorType, errorMessage, context);
  }, []);
  
  const trackButtonClick = useCallback((buttonName: string, properties: Record<string, any> = {}) => {
    analyticsEventBus.publish('custom_event', {
      category: 'ui_interaction',
      action: 'button_click',
      button_name: buttonName,
      screen_name: pathname || 'unknown',
      ...properties
    });
  }, [pathname]);
  
  const trackFeatureUse = useCallback((featureName: string, properties: Record<string, any> = {}) => {
    analyticsEventBus.publish('feature_use', {
      feature_name: featureName,
      screen_name: pathname || 'unknown',
      ...properties
    });
  }, [pathname]);
  
  const trackSearch = useCallback((query: string, resultCount: number, filters: Record<string, any> = {}) => {
    analyticsEventBus.publish('search_query', {
      query,
      result_count: resultCount,
      filters,
      screen_name: pathname || 'unknown'
    });
  }, [pathname]);
  
  const trackUserAction = useCallback((action: string, properties: Record<string, any> = {}) => {
    analyticsEventBus.publish('custom_event', {
      category: 'user_action',
      action,
      screen_name: pathname || 'unknown',
      ...properties
    });
  }, [pathname]);
  
  return {
    trackEvent,
    trackEngagement,
    trackPlay,
    trackError,
    trackButtonClick,
    trackFeatureUse,
    trackSearch,
    trackUserAction
  };
}

/**
 * Convert pathname to screen name
 */
function getScreenNameFromPath(pathname: string): string {
  if (!pathname) return 'Unknown';
  
  // Remove leading slash and split by "/"
  const parts = pathname.replace(/^\//, '').split('/');
  
  // Handle special cases
  if (parts[0] === '') return 'Home';
  if (parts[0] === 'track' && parts.length > 1) return 'TrackDetails';
  if (parts[0] === 'playlist' && parts.length > 1) return 'PlaylistDetails';
  if (parts[0] === 'profile' && parts.length > 1) return 'UserProfile';
  if (parts[0] === 'messages' && parts.length > 1) return 'Conversation';
  
  // For other paths, convert to PascalCase
  return parts[0]
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Hook to track component lifecycle events
 */
export function useComponentAnalytics(componentName: string, props: Record<string, any> = {}) {
  useEffect(() => {
    // Track component mount
    analyticsEventBus.publish('custom_event', {
      category: 'component_lifecycle',
      action: 'mount',
      component_name: componentName,
      props: JSON.stringify(props)
    });
    
    return () => {
      // Track component unmount
      analyticsEventBus.publish('custom_event', {
        category: 'component_lifecycle',
        action: 'unmount',
        component_name: componentName
      });
    };
  }, [componentName]);
  
  const trackInteraction = useCallback((interactionType: string, details: Record<string, any> = {}) => {
    analyticsEventBus.publish('custom_event', {
      category: 'component_interaction',
      action: interactionType,
      component_name: componentName,
      ...details
    });
  }, [componentName]);
  
  return { trackInteraction };
}