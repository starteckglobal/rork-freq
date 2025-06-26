import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  Animated,
  StatusBar,
  ImageBackground,
  Pressable
} from 'react-native';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  ChevronDown, 
  Volume2, 
  Volume1, 
  VolumeX,
  ListPlus
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useUserStore } from '@/store/user-store';
import Slider from '@/components/Slider';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import { defaultCoverArt } from '@/constants/images';
import AddToPlaylistModal from './AddToPlaylistModal';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useComponentAnalytics } from '@/hooks/useAnalytics';

const { width, height } = Dimensions.get('window');

export default function FullPlayer() {
  const { 
    currentTrack, 
    playerState,
    togglePlay, 
    seekTo, 
    currentTime, 
    duration, 
    playNext, 
    playPrevious, 
    toggleRepeat, 
    toggleShuffle, 
    repeatMode, 
    shuffleEnabled, 
    minimizePlayer,
    isMinimized,
    waveformData,
    generateWaveformData
  } = usePlayerStore();
  
  const isPlaying = playerState === 'playing';
  
  const { isLoggedIn, likedTracks, likeTrack, unlikeTrack, setShowLoginModal } = useUserStore();
  
  // Track component analytics
  const { trackInteraction } = useComponentAnalytics('FullPlayer', { 
    trackId: currentTrack?.id,
    playerState
  });
  
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [isDraggingWaveform, setIsDraggingWaveform] = useState(false);
  const [waveformHover, setWaveformHover] = useState(false);
  
  // Animation for player appearance
  const [slideAnim] = useState(new Animated.Value(height));
  const [blurOpacity] = useState(new Animated.Value(0));
  
  // Generate new waveform data when track changes
  useEffect(() => {
    if (currentTrack) {
      generateWaveformData();
    }
  }, [currentTrack?.id]);
  
  useEffect(() => {
    if (!isMinimized && currentTrack) {
      // Show player with animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Hide status bar on mobile
      if (Platform.OS !== 'web') {
        StatusBar.setHidden(true);
      }
      
      // Track player maximize
      analyticsEventBus.publish('custom_event', {
        category: 'ui_interaction',
        action: 'player_maximize',
        track_id: currentTrack.id,
        track_title: currentTrack.title,
      });
    } else {
      // Hide player with animation
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(blurOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Show status bar on mobile
      if (Platform.OS !== 'web') {
        StatusBar.setHidden(false);
      }
      
      if (currentTrack) {
        // Track player minimize
        analyticsEventBus.publish('custom_event', {
          category: 'ui_interaction',
          action: 'player_minimize',
          track_id: currentTrack.id,
          track_title: currentTrack.title,
        });
      }
    }
    
    // Cleanup
    return () => {
      if (Platform.OS !== 'web') {
        StatusBar.setHidden(false);
      }
    };
  }, [isMinimized, currentTrack]);
  
  // Safely check if track is liked - ensure likedTracks is an array before calling includes
  const isLiked = isLoggedIn && currentTrack && likedTracks ? 
    likedTracks.includes(currentTrack.id) : 
    false;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleToggleLike = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (!currentTrack) return;
    
    trackInteraction('like_toggle', { wasLiked: isLiked });
    
    if (isLiked) {
      unlikeTrack(currentTrack.id);
      
      // Track unlike
      analyticsEventBus.publish('track_unlike', {
        track_id: currentTrack.id,
        track_title: currentTrack.title,
        source: 'full_player',
      });
    } else {
      likeTrack(currentTrack.id);
      
      // Track like
      analyticsEventBus.publish('track_like', {
        track_id: currentTrack.id,
        track_title: currentTrack.title,
        source: 'full_player',
      });
    }
  };
  
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    
    // Track volume change
    analyticsEventBus.publish('custom_event', {
      category: 'player',
      action: 'volume_change',
      previous_volume: volume,
      new_volume: value,
      is_muted: value === 0,
    });
  };
  
  const toggleMute = () => {
    trackInteraction('mute_toggle', { wasMuted: isMuted });
    
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
      
      // Track unmute
      analyticsEventBus.publish('custom_event', {
        category: 'player',
        action: 'unmute',
        restored_volume: prevVolume,
      });
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
      
      // Track mute
      analyticsEventBus.publish('custom_event', {
        category: 'player',
        action: 'mute',
        previous_volume: volume,
      });
    }
  };
  
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX size={24} color={colors.text} />;
    } else if (volume < 0.5) {
      return <Volume1 size={24} color={colors.text} />;
    } else {
      return <Volume2 size={24} color={colors.text} />;
    }
  };
  
  const handleAddToPlaylist = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (currentTrack) {
      trackInteraction('add_to_playlist_open');
      
      // Track add to playlist modal open
      analyticsEventBus.publish('custom_event', {
        category: 'ui_interaction',
        action: 'add_to_playlist_modal_open',
        track_id: currentTrack.id,
        track_title: currentTrack.title,
        source: 'full_player',
      });
      
      setShowAddToPlaylist(true);
    }
  };
  
  const handleWaveformSeek = (progress: number) => {
    if (duration) {
      trackInteraction('waveform_seek', { 
        fromTime: currentTime,
        toTime: progress * duration
      });
      
      // Track waveform seek
      analyticsEventBus.publish('track_seek', {
        track_id: currentTrack?.id,
        track_title: currentTrack?.title,
        from_time: currentTime,
        to_time: progress * duration,
        method: 'waveform',
      });
      
      seekTo(progress * duration);
    }
  };
  
  const handleMinimize = () => {
    trackInteraction('minimize');
    minimizePlayer();
  };
  
  if (!currentTrack || isMinimized) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <ImageBackground
        source={{ uri: currentTrack.coverArt || defaultCoverArt }}
        style={styles.backgroundImage}
        blurRadius={Platform.OS === 'web' ? 50 : 20}
      >
        {Platform.OS !== 'web' ? (
          <BlurView intensity={80} style={styles.blurBackground} tint="dark" />
        ) : (
          <View style={styles.webBackground} />
        )}
        
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.minimizeButton}
            onPress={handleMinimize}
          >
            <ChevronDown size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.coverArtContainer}>
            <Image 
              source={{ uri: currentTrack.coverArt || defaultCoverArt }}
              style={styles.coverArt}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
              style={styles.coverArtOverlay}
            />
          </View>
          
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{currentTrack.title}</Text>
            <Text style={styles.artistName}>{currentTrack.artist}</Text>
          </View>
          
          <View style={styles.waveformContainer}>
            <WaveformVisualizer 
              waveformData={waveformData}
              isPlaying={isPlaying && !isDraggingWaveform}
              progress={currentTime / duration}
              onSeek={handleWaveformSeek}
              style={styles.waveform}
              interactive={true}
              onDragStart={() => {
                setIsDraggingWaveform(true);
                trackInteraction('waveform_drag_start');
              }}
              onDragEnd={() => {
                setIsDraggingWaveform(false);
                trackInteraction('waveform_drag_end');
              }}
              onHoverChange={(hovering) => {
                setWaveformHover(hovering);
                trackInteraction(hovering ? 'waveform_hover_start' : 'waveform_hover_end');
              }}
            />
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              value={currentTime}
              minimumValue={0}
              maximumValue={duration}
              onValueChange={(value) => {
                trackInteraction('slider_seek', { 
                  fromTime: currentTime,
                  toTime: value
                });
                
                // Track slider seek
                analyticsEventBus.publish('track_seek', {
                  track_id: currentTrack.id,
                  track_title: currentTrack.title,
                  from_time: currentTime,
                  to_time: value,
                  method: 'slider',
                });
                
                seekTo(value);
              }}
              style={styles.progressSlider}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                trackInteraction('shuffle_toggle', { wasEnabled: shuffleEnabled });
                toggleShuffle();
              }}
            >
              <Shuffle 
                size={24} 
                color={shuffleEnabled ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                trackInteraction('previous');
                playPrevious();
              }}
            >
              <SkipBack size={32} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => {
                trackInteraction('play_pause_toggle', { wasPlaying: isPlaying });
                togglePlay();
              }}
            >
              {isPlaying ? (
                <Pause size={32} color={colors.text} />
              ) : (
                <Play size={32} color={colors.text} fill={colors.text} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                trackInteraction('next');
                playNext();
              }}
            >
              <SkipForward size={32} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                trackInteraction('repeat_toggle', { previousMode: repeatMode });
                toggleRepeat();
              }}
            >
              <Repeat 
                size={24} 
                color={repeatMode !== 'off' ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.additionalControls}>
            <TouchableOpacity 
              style={styles.additionalButton}
              onPress={handleToggleLike}
            >
              <Heart 
                size={24} 
                color={isLiked ? colors.primary : colors.textSecondary}
                fill={isLiked ? colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.additionalButton}
              onPress={handleAddToPlaylist}
            >
              <ListPlus size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.additionalButton}
              onPress={() => {
                if (!isLoggedIn) {
                  setShowLoginModal(true);
                  return;
                }
                
                trackInteraction('share');
                
                // Track share
                analyticsEventBus.publish('track_share', {
                  track_id: currentTrack.id,
                  track_title: currentTrack.title,
                  share_method: 'native_share',
                  source: 'full_player',
                });
                
                // Share functionality would go here
                alert('Share functionality would be implemented here');
              }}
            >
              <Share2 size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.volumeContainer}>
              <TouchableOpacity 
                style={styles.additionalButton}
                onPress={toggleMute}
                onLongPress={() => {
                  setShowVolumeSlider(!showVolumeSlider);
                  trackInteraction('volume_slider_toggle', { 
                    wasVisible: showVolumeSlider 
                  });
                }}
              >
                {getVolumeIcon()}
              </TouchableOpacity>
              
              {showVolumeSlider && (
                <Slider
                  value={volume}
                  minimumValue={0}
                  maximumValue={1}
                  onValueChange={handleVolumeChange}
                  style={styles.volumeSlider}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.additionalButton}
              onPress={() => {
                trackInteraction('more_options');
                
                // Track more options
                analyticsEventBus.publish('custom_event', {
                  category: 'ui_interaction',
                  action: 'more_options',
                  track_id: currentTrack.id,
                  source: 'full_player',
                });
                
                // More options
                alert('More options would be implemented here');
              }}
            >
              <MoreHorizontal size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
      
      {currentTrack && (
        <AddToPlaylistModal
          visible={showAddToPlaylist}
          onClose={() => {
            setShowAddToPlaylist(false);
            
            // Track modal close
            analyticsEventBus.publish('custom_event', {
              category: 'ui_interaction',
              action: 'add_to_playlist_modal_close',
              track_id: currentTrack.id,
              source: 'full_player',
            });
          }}
          track={currentTrack}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    marginBottom: 20,
  },
  minimizeButton: {
    padding: 8,
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  coverArtContainer: {
    position: 'relative',
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coverArt: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
  },
  coverArtOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  trackTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
  waveformContainer: {
    width: '100%',
    height: 80,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 10,
  },
  waveform: {
    width: '100%',
    height: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  progressSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  additionalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  additionalButton: {
    padding: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    width: 100,
    height: 40,
  },
});