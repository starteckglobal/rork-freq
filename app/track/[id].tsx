import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { 
  Play, 
  Heart, 
  Share2, 
  MessageCircle, 
  MoreHorizontal, 
  ChevronLeft 
} from 'lucide-react-native';
import MiniPlayer from '@/components/MiniPlayer';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import { tracks } from '@/mocks/tracks';
import { users } from '@/mocks/users';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { useUserStore } from '@/store/user-store';
import { defaultCoverArt } from '@/constants/images';

export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentTrack, isMinimized, playTrack } = usePlayerStore();
  const { isLoggedIn, likeTrack, unlikeTrack, addToRecentlyPlayed } = useUserStore();
  
  const trackId = id ? String(id) : '';
  const track = tracks.find(t => t.id === trackId);
  
  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Track not found',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Track not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const artist = users.find(u => u.id === track.artistId);
  
  // Safely check if track is liked using isTrackLiked function
  const liked = useUserStore.getState().isTrackLiked(track.id);
  
  useEffect(() => {
    if (track && track.id) {
      addToRecentlyPlayed(track.id);
    }
  }, [track?.id]);
  
  const handlePlay = () => {
    if (track) {
      playTrack(track);
    }
  };
  
  const handleLike = () => {
    if (!track || !track.id) return;
    
    if (liked) {
      unlikeTrack(track.id);
    } else {
      likeTrack(track.id);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };
  
  const formatPlays = (plays: number) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`;
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`;
    }
    return plays.toString();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: track.title,
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          currentTrack && !isMinimized ? styles.contentWithPlayer : null,
        ]}
      >
        <View style={styles.trackHeader}>
          <Image 
            source={{ uri: track.coverArt || defaultCoverArt }} 
            style={styles.coverArt}
          />
          
          <View style={styles.trackInfo}>
            <Text style={styles.title}>{track.title}</Text>
            <TouchableOpacity 
              style={styles.artistLink}
              onPress={() => artist && router.push(`/profile/${artist.id}`)}
            >
              <Text style={styles.artist}>{track.artist}</Text>
            </TouchableOpacity>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatPlays(track.plays)}</Text>
                <Text style={styles.statLabel}>plays</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{track.likes}</Text>
                <Text style={styles.statLabel}>likes</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatDate(track.releaseDate)}</Text>
                <Text style={styles.statLabel}>released</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlay}
              >
                <Play size={20} color={colors.text} fill={colors.text} />
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, liked && styles.likedButton]}
                onPress={handleLike}
              >
                <Heart 
                  size={20} 
                  color={liked ? colors.text : colors.icon}
                  fill={liked ? colors.text : 'transparent'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Share2 size={20} color={colors.icon} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={20} color={colors.icon} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <MoreHorizontal size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.waveformContainer}>
          <WaveformVisualizer 
            waveformData={track.waveformData || []}
            progress={0}
            color={colors.primary}
            backgroundColor={colors.cardElevated}
          />
        </View>
        
        {track.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About</Text>
            <Text style={styles.description}>{track.description}</Text>
          </View>
        )}
        
        <View style={styles.genreContainer}>
          <Text style={styles.genreTitle}>Genre</Text>
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{track.genre}</Text>
          </View>
        </View>
        
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <View style={styles.commentInput}>
            <Text style={styles.commentInputPlaceholder}>Write a comment...</Text>
          </View>
          <View style={styles.noComments}>
            <Text style={styles.noCommentsText}>No comments yet</Text>
            <Text style={styles.noCommentsSubtext}>Be the first to comment on this track</Text>
          </View>
        </View>
      </ScrollView>
      
      {currentTrack && isMinimized && <MiniPlayer />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  contentWithPlayer: {
    paddingBottom: 0,
  },
  trackHeader: {
    padding: 16,
  },
  coverArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.cardElevated,
  },
  trackInfo: {
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  artistLink: {
    marginBottom: 16,
  },
  artist: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    marginRight: 24,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  playButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  likedButton: {
    backgroundColor: colors.primary,
  },
  waveformContainer: {
    height: 80,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  descriptionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  genreContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  genreTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  genreBadge: {
    backgroundColor: colors.cardElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  genreText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  commentsContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  commentsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: colors.cardElevated,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  commentInputPlaceholder: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  noComments: {
    alignItems: 'center',
    padding: 24,
  },
  noCommentsText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noCommentsSubtext: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
});