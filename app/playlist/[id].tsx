import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  Heart, 
  Clock, 
  Share2, 
  Download, 
  Plus, 
  Trash, 
  Edit, 
  Lock, 
  Globe,
  Music,
  ChevronLeft
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { usePlayerStore } from '@/store/player-store';
import { tracks } from '@/mocks/tracks';
import { playlists } from '@/mocks/playlists';
import { users } from '@/mocks/users';
import { Track, Playlist as AudioPlaylist } from '@/types/audio';
import { Playlist as UserPlaylist } from '@/store/user-store';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isLoggedIn, currentUser, likePlaylist, unlikePlaylist, isPlaylistLiked, userPlaylists } = useUserStore();
  const { playTrack, playerState, currentTrack, togglePlay } = usePlayerStore();
  
  const [playlist, setPlaylist] = useState<AudioPlaylist | UserPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Compute isPlaying from playerState
  const isPlaying = playerState === 'playing';
  
  useEffect(() => {
    // Find the playlist by ID - check both mock playlists and user playlists
    let foundPlaylist: AudioPlaylist | UserPlaylist | undefined = playlists.find(p => p.id === id);
    
    // If not found in mock playlists, check user playlists
    if (!foundPlaylist && userPlaylists) {
      foundPlaylist = userPlaylists.find(p => p.id === id);
    }
    
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
      
      // Find the creator - for user playlists, use current user
      let playlistCreator;
      if (foundPlaylist && foundPlaylist.createdBy === currentUser?.id) {
        playlistCreator = currentUser;
      } else if (foundPlaylist) {
        playlistCreator = users.find(user => user.id === foundPlaylist?.createdBy);
      }
      setCreator(playlistCreator);
      
      // Get the tracks in the playlist - use tracks array directly
      const trackIds = foundPlaylist?.tracks || [];
      const foundTracks = tracks.filter(track => 
        trackIds.includes(track.id)
      );
      setPlaylistTracks(foundTracks);
      
      // Check if the playlist is liked by the current user
      if (isLoggedIn && foundPlaylist.id) {
        setIsLiked(isPlaylistLiked(foundPlaylist.id));
      }
    }
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id, isLoggedIn, isPlaylistLiked, userPlaylists, currentUser]);
  
  const handlePlayAll = () => {
    if (playlistTracks && playlistTracks.length > 0) {
      playTrack(playlistTracks[0]);
    }
  };
  
  const handleLikePlaylist = () => {
    if (!isLoggedIn) {
      useUserStore.getState().setShowLoginModal(true);
      return;
    }
    
    if (playlist) {
      if (isLiked) {
        unlikePlaylist(playlist.id);
      } else {
        likePlaylist(playlist.id);
      }
      setIsLiked(!isLiked);
    }
  };
  
  const handleShare = () => {
    Alert.alert("Share", "Sharing functionality would be implemented here.");
  };
  
  const handleDownload = () => {
    Alert.alert("Download", "Download functionality would be implemented here.");
  };
  
  const handleDeletePlaylist = () => {
    if (!playlist) return;
    
    Alert.alert(
      "Delete Playlist",
      "Are you sure you want to delete this playlist? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            // Delete the playlist
            useUserStore.getState().deletePlaylist(playlist.id);
            
            // Navigate back
            router.back();
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleEditPlaylist = () => {
    Alert.alert("Edit Playlist", "Edit functionality would be implemented here.");
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const calculateTotalDuration = () => {
    if (!playlistTracks || playlistTracks.length === 0) return '0 min';
    
    const totalSeconds = playlistTracks.reduce((total, track) => total + (track.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading playlist...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Playlist Not Found',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
        }} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Playlist not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Playlist',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowOptions(!showOptions)}
              style={styles.headerButton}
            >
              <MoreHorizontal size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image 
            source={{ 
              uri: playlist.coverArt || 
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
            }} 
            style={styles.coverArt}
          />
          
          <View style={styles.headerInfo}>
            <Text style={styles.playlistName}>{playlist.name || (playlist as AudioPlaylist).title}</Text>
            
            <TouchableOpacity
              style={styles.creatorButton}
              onPress={() => creator && router.push(`/profile/${creator.id}`)}
            >
              <Text style={styles.creatorText}>
                By {creator?.displayName || 'Unknown Artist'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.playlistStats}>
              <Text style={styles.statsText}>
                {playlistTracks ? playlistTracks.length : 0} {(playlistTracks?.length || 0) === 1 ? 'track' : 'tracks'} • {calculateTotalDuration()}
              </Text>
              
              <View style={styles.privacyBadge}>
                {(playlist as UserPlaylist).isPrivate || !(playlist as AudioPlaylist).isPublic ? (
                  <>
                    <Lock size={12} color={colors.textSecondary} />
                    <Text style={styles.privacyText}>Private</Text>
                  </>
                ) : (
                  <>
                    <Globe size={12} color={colors.textSecondary} />
                    <Text style={styles.privacyText}>Public</Text>
                  </>
                )}
              </View>
            </View>
            
            {playlist.description && (
              <Text style={styles.description}>{playlist.description}</Text>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayAll}
                disabled={!playlistTracks || playlistTracks.length === 0}
              >
                <Play size={20} color={colors.text} fill={colors.text} />
                <Text style={styles.playButtonText}>Play All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleLikePlaylist}
              >
                <Heart 
                  size={20} 
                  color={colors.text} 
                  fill={isLiked ? colors.primary : 'transparent'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share2 size={20} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleDownload}
              >
                <Download size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {showOptions && currentUser && playlist.createdBy === currentUser.id && (
          <View style={styles.optionsMenu}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleEditPlaylist}
            >
              <Edit size={20} color={colors.text} />
              <Text style={styles.optionText}>Edit Playlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleDeletePlaylist}
            >
              <Trash size={20} color="#F44336" />
              <Text style={[styles.optionText, { color: "#F44336" }]}>Delete Playlist</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.tracksContainer}>
          <View style={styles.tracksHeader}>
            <Text style={styles.tracksTitle}>Tracks</Text>
            <Text style={styles.tracksDuration}>Duration</Text>
          </View>
          
          {playlistTracks && playlistTracks.length > 0 ? (
            <View style={styles.tracksList}>
              {playlistTracks.map((track, index) => (
                <TouchableOpacity 
                  key={track.id}
                  style={styles.trackItem}
                  onPress={() => playTrack(track)}
                >
                  <View style={styles.trackNumberContainer}>
                    <Text style={styles.trackNumber}>{index + 1}</Text>
                  </View>
                  
                  <View style={styles.trackCoverContainer}>
                    <Image 
                      source={{ uri: track.coverArt }} 
                      style={styles.trackCover}
                    />
                    <TouchableOpacity 
                      style={styles.trackPlayButton}
                      onPress={() => playTrack(track)}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause size={16} color={colors.text} />
                      ) : (
                        <Play size={16} color={colors.text} fill={colors.text} />
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackArtist}>{track.artist}</Text>
                  </View>
                  
                  <Text style={styles.trackDuration}>
                    {formatDuration(track.duration || 0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Music size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                This playlist is empty
              </Text>
              <TouchableOpacity 
                style={styles.addTracksButton}
                onPress={() => router.push('/search')}
              >
                <Plus size={16} color={colors.text} />
                <Text style={styles.addTracksButtonText}>Add Tracks</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBackButton: {
    marginLeft: 8,
    padding: 8,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
  },
  coverArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerInfo: {
    alignItems: 'center',
  },
  playlistName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  creatorButton: {
    marginBottom: 12,
  },
  creatorText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  playlistStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  privacyText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginRight: 16,
  },
  playButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  optionsMenu: {
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    margin: 16,
    padding: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  tracksContainer: {
    padding: 16,
  },
  tracksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tracksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tracksDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tracksList: {
    gap: 12,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
  },
  trackNumberContainer: {
    width: 24,
    alignItems: 'center',
  },
  trackNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trackCoverContainer: {
    position: 'relative',
    marginRight: 12,
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  trackPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trackDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  addTracksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  addTracksButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});