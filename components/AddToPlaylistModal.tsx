import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { X, Plus, Check, Music } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { defaultCoverArt } from '@/constants/images';
import { useUserStore } from '@/store/user-store';
import { analytics } from '@/services/analytics';
import { Track } from '@/types/audio';
import PlaylistCreationModal from './PlaylistCreationModal';

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  track: Track;
}

export default function AddToPlaylistModal({ 
  visible, 
  onClose, 
  track 
}: AddToPlaylistModalProps) {
  const { userPlaylists, addTrackToPlaylist } = useUserStore();
  
  const [loading, setLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  
  // Reset selections when modal is opened
  useEffect(() => {
    if (visible) {
      // Find playlists that already contain this track
      const initialSelections = userPlaylists
        ? userPlaylists.filter(playlist => playlist.tracks.includes(track.id))
                      .map(playlist => playlist.id)
        : [];
      
      setSelectedPlaylists(initialSelections);
    }
  }, [visible, userPlaylists, track]);
  
  const togglePlaylistSelection = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      if (prev.includes(playlistId)) {
        return prev.filter(id => id !== playlistId);
      } else {
        return [...prev, playlistId];
      }
    });
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Get all playlists
      const allPlaylists = userPlaylists || [];
      
      // For each playlist, check if it should contain the track
      for (const playlist of allPlaylists) {
        const shouldContainTrack = selectedPlaylists.includes(playlist.id);
        const doesContainTrack = playlist.tracks.includes(track.id);
        
        // If the track should be in the playlist but isn't, add it
        if (shouldContainTrack && !doesContainTrack) {
          addTrackToPlaylist(playlist.id, track.id);
          
          // Track analytics event
          analytics.track('track_added_to_playlist', {
            track_id: track.id,
            track_title: track.title,
            playlist_id: playlist.id,
            playlist_name: playlist.name
          });
        }
        
        // Note: We're not removing tracks from playlists here
        // That would typically be done from the playlist view
      }
      
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error saving playlist selections:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to update playlists. Please try again.');
    }
  };
  
  const handlePlaylistCreated = () => {
    // After a playlist is created, we'll refresh our selections
    // The newly created playlist will be in userPlaylists from the store
    if (userPlaylists && userPlaylists.length > 0) {
      // Find the most recently created playlist (assuming it's the last one)
      const newPlaylist = userPlaylists[userPlaylists.length - 1];
      // Add it to our selections
      setSelectedPlaylists(prev => [...prev, newPlaylist.id]);
    }
    
    setShowCreatePlaylist(false);
  };
  
  const renderPlaylistItem = ({ item }: { item: any }) => {
    const isSelected = selectedPlaylists.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.playlistItem, isSelected && styles.playlistItemSelected]}
        onPress={() => togglePlaylistSelection(item.id)}
        disabled={loading}
      >
        <Image 
          source={{ uri: item.coverArt || defaultCoverArt }}
          style={styles.playlistImage}
        />
        
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistDetails} numberOfLines={1}>
            {item.tracks.length} {item.tracks.length === 1 ? 'track' : 'tracks'}
            {item.isPrivate ? ' • Private' : ''}
          </Text>
        </View>
        
        <View style={[styles.checkboxContainer, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={16} color={colors.text} />}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Ensure playlists is always an array
  const playlists = userPlaylists || [];
  
  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Add to Playlist</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                disabled={loading}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.trackInfoContainer}>
              <Image 
                source={{ uri: track.coverArt || defaultCoverArt }}
                style={styles.trackImage}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.createPlaylistButton}
              onPress={() => setShowCreatePlaylist(true)}
              disabled={loading}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.createPlaylistText}>Create New Playlist</Text>
            </TouchableOpacity>
            
            {playlists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Music size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>You don't have any playlists yet</Text>
                <Text style={styles.emptySubtext}>Create a playlist to add this track</Text>
              </View>
            ) : (
              <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={item => item.id}
                style={styles.playlistList}
                contentContainerStyle={styles.playlistListContent}
              />
            )}
            
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.cancelButton, loading && styles.disabledButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <PlaylistCreationModal
        visible={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        initialTrackId={track.id}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  trackInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createPlaylistText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  playlistList: {
    flex: 1,
  },
  playlistListContent: {
    padding: 16,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  playlistItemSelected: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  playlistImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  playlistDetails: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});