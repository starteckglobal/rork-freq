import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { 
  Home, 
  Search, 
  Library, 
  User, 
  Zap
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { usePlayerStore } from '@/store/player-store';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import { useAnalytics } from '@/hooks/useAnalytics';

const { width, height } = Dimensions.get('window');

export default function TabLayout() {
  const { isLoggedIn } = useUserStore();
  const { currentTrack, isMinimized } = usePlayerStore();
  const analytics = useAnalytics();

  // Track tab navigation
  useEffect(() => {
    analyticsEventBus.publish('screen_view', {
      screen_name: 'Tab Layout',
      is_logged_in: isLoggedIn
    });
  }, [isLoggedIn]);

  // Calculate bottom padding for tab bar based on player visibility
  const tabBarStyle = {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    zIndex: 50,
  };

  // Track tab changes
  const handleTabPress = (tabName: string) => {
    analyticsEventBus.publish('tab_change', {
      tab_name: tabName,
      previous_tab: null, // We don't have access to the previous tab here
      user_id: useUserStore.getState().currentUser?.id,
    });
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: tabBarStyle,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
          listeners={{
            tabPress: () => handleTabPress('Home')
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
          listeners={{
            tabPress: () => handleTabPress('Search')
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
          }}
          listeners={{
            tabPress: () => handleTabPress('Library')
          }}
        />
        <Tabs.Screen
          name="synclab"
          options={{
            title: 'SyncLab',
            tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
          }}
          listeners={{
            tabPress: () => handleTabPress('SyncLab')
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
          listeners={{
            tabPress: () => handleTabPress('Profile')
          }}
        />
      </Tabs>
      
      {/* Player components */}
      {currentTrack && <MiniPlayer />}
      {currentTrack && <FullPlayer />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});