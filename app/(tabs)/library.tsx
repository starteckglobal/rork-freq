import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Music, ListMusic, FolderPlus, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import TrackList from '@/components/TrackList';
import PlaylistCard from '@/components/PlaylistCard';
import { playlists } from '@/mocks/playlists';
import { tracks } from '@/mocks/tracks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Playlist } from '@/types/audio';
import PlaylistCreationModal from '@/components/PlaylistCreationModal';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useAnalytics } from '@/hooks/useAnalytics';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
  const router = useRouter();
  const { isLoggedIn, likedTracks, recentlyPlayed, showLoginModal, setShowLoginModal } = useUserStore();
  const [activeTab, setActiveTab] = useState('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(playlists);
  const analytics = useAnalytics();
  
  // Filter liked tracks
  const likedTracksList = tracks.filter(track => likedTracks?.includes(track.id) || false);
  
  // Filter recently played tracks
  const recentlyPlayedList = tracks.filter(track => 
    recentlyPlayed?.includes(track.id) || false
  );
  
  // Track screen view
  useEffect(() => {
    analyticsEventBus.publish('screen_view', { 
      screen_name: 'Library',
      active_tab: activeTab
    });
  }, [activeTab]);
  
  const handleCreatePlaylist = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    analytics.trackFeatureUse('create_playlist', { source: 'library_screen' });
    setShowCreateModal(true);
  };
  
  const handlePlaylistCreated = (playlistId: string) => {
    // In a real app, we would fetch the new playlist from the API
    // For now, we'll just add a mock playlist to the list
    const newPlaylist: Playlist = {
      id: playlistId,
      name: 'New Playlist',
      description: '',
      coverArt: '',
      tracks: [],
      createdBy: 'You',
      isPrivate: false,
      createdAt: Date.now(),
    };
    
    setUserPlaylists([newPlaylist, ...userPlaylists]);
    
    // Track playlist creation success
    analyticsEventBus.publish('playlist_create', {
      playlist_id: playlistId,
      playlist_name: newPlaylist.name,
      is_private: newPlaylist.isPrivate,
      source: 'library_screen'
    });
    
    // Show success toast or notification
    Alert.alert('Success', 'Playlist created successfully!');
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Track tab change
    analyticsEventBus.publish('custom_event', {
      category: 'ui_interaction',
      action: 'tab_change',
      tab,
      screen: 'library'
    });
  };
  
  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <PlaylistCard
      playlist={item}
      onPress={() => {
        // Track playlist click
        analyticsEventBus.publish('custom_event', {
          category: 'content_interaction',
          action: 'playlist_click',
          playlist_id: item.id,
          playlist_name: item.name,
          source: 'library_screen'
        });
        
        router.push(`/playlist/${item.id}`);
      }}
    />
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleCreatePlaylist}
            accessibilityLabel="Create playlist"
            accessibilityHint="Creates a new playlist"
          >
            <Plus size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
            onPress={() => handleTabChange('playlists')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'playlists' }}
          >
            <ListMusic size={20} color={activeTab === 'playlists' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>
              Playlists
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
            onPress={() => handleTabChange('tracks')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'tracks' }}
          >
            <Music size={20} color={activeTab === 'tracks' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
              Liked Tracks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => handleTabChange('recent')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'recent' }}
          >
            <Clock size={20} color={activeTab === 'recent' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
              Recent
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {activeTab === 'playlists' ? (
        <View style={styles.content}>
          {!isLoggedIn ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Create your first playlist</Text>
              <Text style={styles.emptyStateText}>
                Log in to create and save playlists of your favorite tracks
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  analyticsEventBus.publish('custom_event', {
                    category: 'user_action',
                    action: 'login_prompt_click',
                    source: 'library_playlists'
                  });
                  setShowLoginModal(true);
                }}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          ) : userPlaylists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Create your first playlist</Text>
              <Text style={styles.emptyStateText}>
                It's easy to organize your favorite music into playlists
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreatePlaylist}
              >
                <FolderPlus size={20} color={colors.text} />
                <Text style={styles.createButtonText}>Create Playlist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={userPlaylists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.playlistGrid}
              columnWrapperStyle={styles.playlistRow}
              ListHeaderComponent={
                <TouchableOpacity 
                  style={styles.createPlaylistCard}
                  onPress={handleCreatePlaylist}
                >
                  <View style={styles.createPlaylistIcon}>
                    <Plus size={32} color={colors.text} />
                  </View>
                  <Text style={styles.createPlaylistText}>Create Playlist</Text>
                </TouchableOpacity>
              }
            />
          )}
        </View>
      ) : activeTab === 'tracks' ? (
        <View style={styles.content}>
          {!isLoggedIn ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Save tracks you like</Text>
              <Text style={styles.emptyStateText}>
                Log in to save tracks to your library
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  analyticsEventBus.publish('custom_event', {
                    category: 'user_action',
                    action: 'login_prompt_click',
                    source: 'library_tracks'
                  });
                  setShowLoginModal(true);
                }}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          ) : likedTracksList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No liked tracks yet</Text>
              <Text style={styles.emptyStateText}>
                Tap the heart icon on any track to add it to your liked tracks
              </Text>
            </View>
          ) : (
            <TrackList 
              title="Liked Tracks"
              tracks={likedTracksList}
              showHeader={false}
            />
          )}
        </View>
      ) : (
        <View style={styles.content}>
          {!isLoggedIn ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>See your listening history</Text>
              <Text style={styles.emptyStateText}>
                Log in to view your recently played tracks
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  analyticsEventBus.publish('custom_event', {
                    category: 'user_action',
                    action: 'login_prompt_click',
                    source: 'library_recent'
                  });
                  setShowLoginModal(true);
                }}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          ) : recentlyPlayedList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No recent tracks</Text>
              <Text style={styles.emptyStateText}>
                Start playing some music to see your recently played tracks here
              </Text>
            </View>
          ) : (
            <TrackList 
              title="Recently Played"
              tracks={recentlyPlayedList}
              showHeader={false}
            />
          )}
        </View>
      )}
      
      <PlaylistCreationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePlaylistCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
  },
  tabs: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabsContainer: {
    paddingRight: 16, // Ensure last tab is not cut off
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  activeTab: {
    backgroundColor: colors.cardElevated,
  },
  tabText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100, // Increased to ensure content is not hidden behind tab bar
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  playlistGrid: {
    paddingBottom: 100, // Increased to ensure content is not hidden behind tab bar
  },
  playlistRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  createPlaylistCard: {
    width: '100%',
    height: 80,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  createPlaylistIcon: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createPlaylistText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
});