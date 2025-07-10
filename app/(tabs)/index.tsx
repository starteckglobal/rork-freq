import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import TrackList from '@/components/TrackList';
import PlaylistRow from '@/components/PlaylistRow';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import { featuredTracks, newReleases, trendingTracks } from '@/mocks/tracks';
import { featuredPlaylists } from '@/mocks/playlists';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useUserStore } from '@/store/user-store';
import { useNotificationsStore } from '@/store/notifications-store';
import { freqLogoUrl } from '@/constants/images';
import { UserPlus, Upload, MessageCircle, Bell } from 'lucide-react-native';
import LoginModal from '@/components/LoginModal';
import UploadTrackModal from '@/components/UploadTrackModal';
import StyledButton from '@/components/StyledButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationSimulator } from '@/hooks/useNotificationSimulator';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { currentTrack, isMinimized } = usePlayerStore();
  const { isLoggedIn, setShowLoginModal, showLoginModal } = useUserStore();
  const { unreadCount } = useNotificationsStore();
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const insets = useSafeAreaInsets();
  
  // Enable live notifications simulation
  useNotificationSimulator();
  
  const handleLoginPress = () => {
    setShowLoginModal(true);
  };
  
  const handleProfilePress = () => {
    if (isLoggedIn) {
      router.push('/profile');
    } else {
      setShowLoginModal(true);
    }
  };
  
  const handleUploadPress = () => {
    if (isLoggedIn) {
      setShowUploadModal(true);
    } else {
      setShowLoginModal(true);
    }
  };
  
  // Calculate content padding based on player state
  const getContentPaddingBottom = () => {
    const baseTabBarHeight = Platform.OS === 'ios' ? 80 + insets.bottom : 70;
    const miniPlayerHeight = 60;
    
    if (currentTrack && isMinimized) {
      return baseTabBarHeight + miniPlayerHeight;
    } else if (currentTrack && !isMinimized) {
      return 20; // Full player covers everything
    } else {
      return baseTabBarHeight;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'FREQ',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.primary,
          fontSize: 22,
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.push('/')}>
            <Image 
              source={{ uri: freqLogoUrl }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            {isLoggedIn && (
              <>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => router.push('/messages')}
                >
                  <MessageCircle size={20} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => router.push('/notifications')}
                >
                  <Bell size={20} color={colors.text} />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUploadPress}
            >
              <Upload size={20} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerButtonContainer}>
              {!isLoggedIn ? (
                <StyledButton
                  title="Login+"
                  onPress={handleLoginPress}
                  style={styles.headerButton}
                  textStyle={styles.headerButtonText}
                />
              ) : (
                <StyledButton
                  title="My Profile"
                  onPress={() => router.push('/profile')}
                  style={styles.headerButton}
                  textStyle={styles.headerButtonText}
                  variant="secondary"
                />
              )}
            </View>
          </View>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getContentPaddingBottom() }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PlaylistRow title="Featured Playlists" playlists={featuredPlaylists} />
        <TrackList title="Trending Now" tracks={trendingTracks} />
        <TrackList title="New Releases" tracks={newReleases} />
        <TrackList title="Recommended for You" tracks={featuredTracks} />
      </ScrollView>
      
      <LoginModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <UploadTrackModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(trackId) => {
          // Handle successful upload
          console.log(`Track uploaded with ID: ${trackId}`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    backgroundColor: colors.cardElevated,
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: colors.cardElevated,
    padding: 8,
    borderRadius: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4169E1', // Royal blue
    paddingVertical: 6, // Reduced padding
    paddingHorizontal: 12, // Reduced padding
    borderRadius: 20,
    minHeight: 36, // Smaller height
    minWidth: 90, // Ensure button is wide enough
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 14, // Smaller font
    fontWeight: '600',
    marginLeft: 6, // Reduced margin
  },
  profileButton: {
    backgroundColor: '#4169E1', // Royal blue
    paddingVertical: 6, // Reduced padding
    paddingHorizontal: 12, // Reduced padding
    borderRadius: 20,
  },
  profileButtonText: {
    color: colors.text,
    fontSize: 14, // Smaller font
    fontWeight: '600',
  },
  headerButtonContainer: {
    alignItems: 'center',
  },
  headerButton: {
    minWidth: 80,
    minHeight: 32,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});