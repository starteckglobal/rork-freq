import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { Play, Pause, SkipForward, Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useUserStore } from '@/store/user-store';
import { defaultCoverArt } from '@/constants/images';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { 
    currentTrack, 
    playerState,
    togglePlay, 
    playNext, 
    maximizePlayer,
    isMinimized
  } = usePlayerStore();
  
  const isPlaying = playerState === 'playing';
  
  const { isLoggedIn, likedTracks, likeTrack, unlikeTrack, setShowLoginModal } = useUserStore();
  
  if (!currentTrack || !isMinimized) return null;
  
  // Safely check if track is liked - ensure likedTracks is an array before calling includes
  const isLiked = isLoggedIn && likedTracks && likedTracks.includes(currentTrack.id);
  
  const handleToggleLike = (e: any) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (isLiked) {
      unlikeTrack(currentTrack.id);
    } else {
      likeTrack(currentTrack.id);
    }
  };
  
  const handleTogglePlay = (e: any) => {
    e.stopPropagation();
    togglePlay();
  };
  
  const handlePlayNext = (e: any) => {
    e.stopPropagation();
    playNext();
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={maximizePlayer}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: currentTrack.coverArt || defaultCoverArt }}
        style={styles.coverArt}
      />
      
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleToggleLike}
        >
          <Heart 
            size={20} 
            color={isLiked ? colors.primary : colors.textSecondary}
            fill={isLiked ? colors.primary : 'transparent'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={handleTogglePlay}
        >
          {isPlaying ? (
            <Pause size={20} color={colors.text} />
          ) : (
            <Play size={20} color={colors.text} fill={colors.text} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handlePlayNext}
        >
          <SkipForward size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: colors.cardElevated,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  coverArt: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistName: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});