import { StateCreator, StoreApi } from 'zustand';

interface AnalyticsMiddlewareOptions<T> {
  storeName: string;
  getUserId: (state: T) => string | undefined;
  ignoreActions?: string[];
  transformStateChange?: (
    actionName: string,
    prevState: T,
    nextState: T
  ) => Record<string, any>;
}

// Simplified middleware that works with Zustand
export function createAnalyticsMiddleware<T extends object>(
  options: AnalyticsMiddlewareOptions<T>
) {
  const { storeName, getUserId, ignoreActions = [], transformStateChange } = options;

  return (config: StateCreator<T>) => 
    (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => {
      // Create a custom setState that tracks state changes
      const trackingSet: typeof set = (partial, replace) => {
        const prevState = get();
        
        // Call the original set function with type handling
        if (replace === true) {
          set(partial as T | ((state: T) => T), true);
        } else {
          set(partial, replace as false | undefined);
        }
        
        // Get the updated state
        const nextState = get();
        
        // Don't track if the states are identical (no change)
        if (prevState === nextState) return;
        
        // Determine what changed
        const changes: Record<string, { prev: any; next: any }> = {};
        
        // Track all top-level changes
        Object.keys(nextState).forEach((key) => {
          // Skip if this action should be ignored
          if (ignoreActions?.includes(key)) return;
          
          // Check if the value changed
          const typedKey = key as keyof typeof nextState;
          if (prevState[typedKey] !== nextState[typedKey]) {
            changes[key] = {
              prev: prevState[typedKey],
              next: nextState[typedKey],
            };
          }
        });
        
        // If nothing changed, return
        if (Object.keys(changes).length === 0) return;
        
        // Get the user ID for tracking
        const userId = getUserId(nextState);
        
        // For each change, track an analytics event
        Object.keys(changes).forEach((actionName) => {
          // Get the analytics event bus (imported here to avoid circular dependencies)
          try {
            const { analyticsEventBus } = require('./analytics-event-bus');
            
            // Basic event data
            const eventData: Record<string, any> = {
              store: storeName,
              action: actionName,
              user_id: userId,
            };
            
            // Add custom transformed data if available
            if (transformStateChange) {
              const transformedData = transformStateChange(
                actionName,
                prevState,
                nextState
              );
              
              Object.assign(eventData, transformedData);
            }
            
            // Track the state change
            analyticsEventBus.publish('state_change', eventData);
          } catch (error) {
            console.error('Error publishing analytics event:', error);
          }
        });
      };
      
      // Return the store with the tracking set function
      return config(trackingSet, get, api);
    };
}