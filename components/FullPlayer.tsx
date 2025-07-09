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
  Heart, 
  Share2, 
  MoreHorizontal, 
  ChevronDown, 
  Volume2,
  RotateCcw,
  RotateCw
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
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  
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
    
    // Track volume change
    analyticsEventBus.publish('custom_event', {
      category: 'player',
      action: 'volume_change',
      previous_volume: volume,
      new_volume: value,
    });
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
  
  const handleShare = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    trackInteraction('share');
    
    // Track share
    analyticsEventBus.publish('track_share', {
      track_id: currentTrack?.id || '',
      track_title: currentTrack?.title || '',
      share_method: 'native_share',
      source: 'full_player',
    });
    
    // Share functionality would go here
    alert('Share functionality would be implemented here');
  };
  
  const handleRewind = () => {
    const newTime = Math.max(0, currentTime - 10);
    seekTo(newTime);
    
    trackInteraction('rewind_10s');
    
    analyticsEventBus.publish('track_seek', {
      track_id: currentTrack?.id,
      track_title: currentTrack?.title,
      from_time: currentTime,
      to_time: newTime,
      method: 'rewind_button',
    });
  };
  
  const handleFastForward = () => {
    const newTime = Math.min(duration, currentTime + 30);
    seekTo(newTime);
    
    trackInteraction('fast_forward_30s');
    
    analyticsEventBus.publish('track_seek', {
      track_id: currentTrack?.id,
      track_title: currentTrack?.title,
      from_time: currentTime,
      to_time: newTime,
      method: 'fast_forward_button',
    });
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
        blurRadius={Platform.OS === 'web' ? 30 : 15}
      >
        {Platform.OS !== 'web' ? (
          <BlurView intensity={60} style={styles.blurBackground} tint="dark" />
        ) : (
          <View style={styles.webBackground} />
        )}
        
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleMinimize}
          >
            <ChevronDown size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Now Playing</Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
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
            <MoreHorizontal size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <View style={styles.content}>
          {/* Album Art */}
          <View style={styles.albumArtContainer}>
            <Image 
              source={{ uri: currentTrack.coverArt || defaultCoverArt }}
              style={styles.albumArt}
              resizeMode="cover"
            />
            <View style={styles.albumArtOverlay} />
          </View>
          
          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{currentTrack.title}</Text>
            <Text style={styles.artistName}>{currentTrack.artist}</Text>
          </View>
          
          {/* Waveform */}
          <View style={styles.waveformContainer}>
            <WaveformVisualizer 
              waveformData={waveformData}
              isPlaying={isPlaying}
              progress={currentTime / duration}
              onSeek={handleWaveformSeek}
              style={styles.waveform}
              interactive={true}
              color="#007AFF"
              backgroundColor="rgba(0,122,255,0.2)"
            />
          </View>
          
          {/* Progress Bar */}
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
              minimumTrackTintColor="rgba(255,255,255,0.8)"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="rgba(255,255,255,0.9)"
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          {/* Main Controls */}
          <View style={styles.mainControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleToggleLike}
            >
              <Heart 
                size={28} 
                color={isLiked ? colors.primary : "rgba(255,255,255,0.8)"}
                fill={isLiked ? colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                trackInteraction('previous');
                playPrevious();
              }}
            >
              <SkipBack size={32} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => {
                trackInteraction('play_pause_toggle', { wasPlaying: isPlaying });
                togglePlay();
              }}
            >
              {isPlaying ? (
                <Pause size={28} color="rgba(0,0,0,0.9)" />
              ) : (
                <Play size={28} color="rgba(0,0,0,0.9)" fill="rgba(0,0,0,0.9)" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                trackInteraction('next');
                playNext();
              }}
            >
              <SkipForward size={32} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleShare}
            >
              <Share2 size={28} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          
          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.bottomControlButton}
              onPress={handleRewind}
            >
              <RotateCcw size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.bottomControlText}>10</Text>
            </TouchableOpacity>
            
            <View style={styles.volumeContainer}>
              <Volume2 size={20} color="rgba(255,255,255,0.7)" />
              <Slider
                value={volume}
                minimumValue={0}
                maximumValue={1}
                onValueChange={handleVolumeChange}
                style={styles.volumeSlider}
                minimumTrackTintColor="rgba(255,255,255,0.8)"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor="rgba(255,255,255,0.9)"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.bottomControlButton}
              onPress={handleFastForward}
            >
              <RotateCw size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.bottomControlText}>30</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  albumArtContainer: {
    width: width * 0.75,
    height: width * 0.75,
    maxWidth: 320,
    maxHeight: 320,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardElevated,
  },
  albumArtOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  trackTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  artistName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  waveformContainer: {
    width: '100%',
    height: 80,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  waveform: {
    width: '100%',
    height: 80,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  progressSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  bottomControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  bottomControlText: {
    position: 'absolute',
    bottom: -2,
    right: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginLeft: 12,
  },
});