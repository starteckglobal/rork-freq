import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { Play, Pause, Heart, MoreHorizontal, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Track } from '@/types/audio';
import { usePlayerStore } from '@/store/player-store';
import { useUserStore } from '@/store/user-store';
import { defaultCoverArt } from '@/constants/images';
import AddToPlaylistModal from './AddToPlaylistModal';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useComponentAnalytics } from '@/hooks/useAnalytics';

interface TrackCardProps {
  track: Track;
  onPress?: () => void;
  showArtist?: boolean;
  showOptions?: boolean;
  showAddToPlaylist?: boolean;
  index?: number;
}

export default function TrackCard({ 
  track, 
  onPress, 
  showArtist = true,
  showOptions = true,
  showAddToPlaylist = true,
  index
}: TrackCardProps) {
  const router = useRouter();
  const { currentTrack, playerState, playTrack, togglePlay } = usePlayerStore();
  const { isLoggedIn, likedTracks, likeTrack, unlikeTrack, setShowLoginModal } = useUserStore();
  
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Track component analytics
  const { trackInteraction } = useComponentAnalytics('TrackCard', { trackId: track.id });
  
  const isPlaying = currentTrack?.id === track.id && playerState === 'playing';
  const isSelected = currentTrack?.id === track.id;
  const isLiked = isLoggedIn && likedTracks && likedTracks.includes(track.id);
  
  const handlePress = () => {
    trackInteraction('press', { isSelected });
    
    if (isSelected) {
      togglePlay();
      
      // Track play/pause
      analyticsEventBus.publish(isPlaying ? 'track_pause' : 'track_play', {
        track_id: track.id,
        track_title: track.title,
        action: isPlaying ? 'pause' : 'resume',
        source: 'track_card',
      });
    } else if (onPress) {
      onPress();
    } else {
      // Track play new
      analyticsEventBus.publish('track_play', {
        track_id: track.id,
        track_title: track.title,
        action: 'play_new',
        source: 'track_card',
      });
      
      playTrack(track);
    }
  };
  
  const handleLike = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    trackInteraction('like_toggle', { wasLiked: isLiked });
    
    if (isLiked) {
      unlikeTrack(track.id);
      
      // Track unlike
      analyticsEventBus.publish('track_unlike', {
        track_id: track.id,
        track_title: track.title,
        source: 'track_card',
      });
    } else {
      likeTrack(track.id);
      
      // Track like
      analyticsEventBus.publish('track_like', {
        track_id: track.id,
        track_title: track.title,
        source: 'track_card',
      });
    }
  };
  
  const handleAddToPlaylist = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    trackInteraction('add_to_playlist_open');
    
    // Track add to playlist modal open
    analyticsEventBus.publish('custom_event', {
      category: 'ui_interaction',
      action: 'add_to_playlist_modal_open',
      track_id: track.id,
      track_title: track.title,
      source: 'track_card',
    });
    
    setShowAddToPlaylistModal(true);
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const handleOptions = () => {
    trackInteraction('options_open');
    
    // Track options open
    analyticsEventBus.publish('custom_event', {
      category: 'ui_interaction',
      action: 'track_options_open',
      track_id: track.id,
      track_title: track.title,
    });
    
    Alert.alert(
      track.title,
      "Choose an option",
      [
        {
          text: "View Artist",
          onPress: () => {
            analyticsEventBus.publish('custom_event', {
              category: 'navigation',
              action: 'view_artist',
              artist_id: track.artistId,
              source: 'track_options',
            });
            router.push(`/profile/${track.artistId}`);
          },
        },
        {
          text: "View Track",
          onPress: () => {
            analyticsEventBus.publish('custom_event', {
              category: 'navigation',
              action: 'view_track_details',
              track_id: track.id,
              source: 'track_options',
            });
            router.push(`/track/${track.id}`);
          },
        },
        {
          text: "Add to Queue",
          onPress: () => {
            usePlayerStore.getState().addToQueue(track);
            analyticsEventBus.publish('custom_event', {
              category: 'player',
              action: 'add_to_queue',
              track_id: track.id,
              source: 'track_options',
            });
            Alert.alert("Added to Queue", `${track.title} has been added to your queue`);
          },
        },
        {
          text: "Share",
          onPress: () => {
            analyticsEventBus.publish('custom_event', {
              category: 'sharing',
              action: 'track_share',
              track_id: track.id,
              track_title: track.title,
              share_method: 'native_share',
              source: 'track_options',
            });
            Alert.alert("Share", "Sharing functionality would be implemented here");
          },
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };
  
  // Create props object for TouchableOpacity with conditional mouse event handlers
  const touchableProps: any = {
    style: [
      styles.container, 
      isSelected && styles.selectedContainer,
      index !== undefined && index % 2 === 0 && styles.alternateContainer
    ],
    onPress: handlePress,
    activeOpacity: 0.7,
  };
  
  // Add mouse event handlers only on web platform
  if (Platform.OS === 'web') {
    touchableProps.onMouseEnter = () => {
      setIsHovering(true);
      trackInteraction('hover_start');
    };
    touchableProps.onMouseLeave = () => {
      setIsHovering(false);
      trackInteraction('hover_end');
    };
  }
  
  return (
    <>
      <TouchableOpacity {...touchableProps}>
        <View style={styles.leftSection}>
          {index !== undefined && (
            <Text style={[styles.indexNumber, isSelected && styles.selectedText]}>
              {index + 1}
            </Text>
          )}
          <View style={styles.artworkContainer}>
            <Image 
              source={{ uri: track.coverArt || defaultCoverArt }}
              style={styles.artwork}
            />
            <TouchableOpacity 
              style={[
                styles.playButton, 
                (isPlaying || isHovering) && styles.visiblePlayButton
              ]}
              onPress={handlePress}
            >
              {isPlaying ? (
                <Pause size={16} color={colors.text} />
              ) : (
                <Play size={16} color={colors.text} fill={colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text 
            style={[styles.title, isSelected && styles.selectedText]} 
            numberOfLines={1}
          >
            {track.title}
          </Text>
          
          {showArtist && (
            <Text 
              style={styles.artist}
              numberOfLines={1}
              onPress={() => {
                analyticsEventBus.publish('custom_event', {
                  category: 'navigation',
                  action: 'artist_name_click',
                  artist_id: track.artistId,
                  source: 'track_card',
                });
                router.push(`/profile/${track.artistId}`);
              }}
            >
              {track.artist}
            </Text>
          )}
        </View>
        
        <View style={styles.rightSection}>
          <Text style={styles.duration}>{formatDuration(track.duration || 0)}</Text>
          
          {showOptions && (
            <View style={styles.actions}>
              {showAddToPlaylist && (
                <TouchableOpacity 
                  style={[styles.actionButton, isHovering && styles.visibleAction]}
                  onPress={handleAddToPlaylist}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Plus size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, (isLiked || isHovering) && styles.visibleAction]}
                onPress={handleLike}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Heart 
                  size={18} 
                  color={isLiked ? colors.primary : colors.textSecondary}
                  fill={isLiked ? colors.primary : 'transparent'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, isHovering && styles.visibleAction]}
                onPress={handleOptions}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreHorizontal size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <AddToPlaylistModal
        visible={showAddToPlaylistModal}
        onClose={() => {
          setShowAddToPlaylistModal(false);
          analyticsEventBus.publish('custom_event', {
            category: 'ui_interaction',
            action: 'add_to_playlist_modal_close',
            track_id: track.id,
          });
        }}
        track={track}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  alternateContainer: {
    backgroundColor: `${colors.card}80`,
  },
  selectedContainer: {
    backgroundColor: `${colors.primary}20`,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  indexNumber: {
    width: 24,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  artworkContainer: {
    position: 'relative',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  playButton: {
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
    opacity: 0,
  },
  visiblePlayButton: {
    opacity: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedText: {
    color: colors.primary,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  duration: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
    opacity: Platform.OS === 'web' ? 0 : 1,
  },
  visibleAction: {
    opacity: 1,
  },
});