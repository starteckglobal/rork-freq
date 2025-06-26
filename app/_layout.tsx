import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import LoginModal from '@/components/LoginModal';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { showLoginModal, setShowLoginModal } = useUserStore();
  
  const [loaded] = useFonts({
    // Add any custom fonts here if needed
  });
  
  if (!loaded) {
    return null;
  }
  
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="track/[id]"
          options={{
            title: 'Track',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="playlist/[id]"
          options={{
            title: 'Playlist',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="profile/[id]"
          options={{
            title: 'Profile',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="analytics/index"
          options={{
            title: 'Analytics',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="messages/index"
          options={{
            title: 'Messages',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{
            title: 'Conversation',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="messages/new"
          options={{
            title: 'New Message',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
      
      {showLoginModal && <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />}
    </>
  );
}