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
import { freqLogoUrl } from '@/constants/images';
import { UserPlus, Upload } from 'lucide-react-native';
import LoginModal from '@/components/LoginModal';
import UploadTrackModal from '@/components/UploadTrackModal';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { currentTrack, isMinimized } = usePlayerStore();
  const { isLoggedIn, setShowLoginModal, showLoginModal } = useUserStore();
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  
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
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUploadPress}
            >
              <Upload size={20} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLoginPress}
              testID="header-login-button"
            >
              {!isLoggedIn ? (
                <>
                  <UserPlus size={20} color={colors.text} />
                  <Text style={styles.loginButtonText}>Login+</Text>
                </>
              ) : (
                <TouchableOpacity 
                  onPress={() => router.push('/profile')}
                  style={styles.profileButton}
                >
                  <Text style={styles.profileButtonText}>My Profile</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          currentTrack && !isMinimized ? styles.contentWithPlayer : null,
          currentTrack && isMinimized ? styles.contentWithMiniPlayer : null,
        ]}
      >
        <PlaylistRow title="Featured Playlists" playlists={featuredPlaylists} />
        <TrackList title="Trending Now" tracks={trendingTracks} />
        <TrackList title="New Releases" tracks={newReleases} />
        <TrackList title="Recommended for You" tracks={featuredTracks} />
      </ScrollView>
      
      {currentTrack && isMinimized && <MiniPlayer />}
      {currentTrack && !isMinimized && <FullPlayer />}
      
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
    paddingBottom: Platform.OS === 'web' ? 16 : 100, // Increased to ensure content is not hidden behind tab bar
  },
  contentWithPlayer: {
    paddingBottom: 0,
  },
  contentWithMiniPlayer: {
    paddingBottom: Platform.OS === 'web' ? 60 : 140, // Extra space for mini player
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: colors.cardElevated,
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
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
  }
});