import React, { useState } from 'react';
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
  ChevronLeft, 
  Share2, 
  MoreHorizontal, 
  Plus,
  Users,
  UserCheck,
  MessageCircle
} from 'lucide-react-native';
import TrackList from '@/components/TrackList';
import MiniPlayer from '@/components/MiniPlayer';
import { tracks } from '@/mocks/tracks';
import { users } from '@/mocks/users';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { defaultAvatarUri } from '@/constants/images';
import FollowersModal from '@/components/FollowersModal';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentTrack, isMinimized } = usePlayerStore();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const userId = id ? String(id) : '';
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'User not found',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Filter tracks by this artist
  const userTracks = tracks.filter(track => track.artistId === user.id);
  
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };
  
  const handleMessage = () => {
    // Find or create a conversation with this user
    // For now, we'll use a simple conversation ID based on user ID
    const conversationId = `conv-${user.id}`;
    router.push(`/messages/${conversationId}`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: user.displayName,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton}>
              <Share2 size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MoreHorizontal size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          currentTrack && !isMinimized ? styles.contentWithPlayer : null,
        ]}
      >
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: user.avatarUrl || defaultAvatarUri }} 
            style={styles.avatar}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.statValue}>{user.tracksCount}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.statValue}>{user.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowingModal(true)}
              >
                <Text style={styles.statValue}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
            
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
            
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton
                ]}
                onPress={toggleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color={colors.text} />
                    <Text style={styles.followButtonText}>Following</Text>
                  </>
                ) : (
                  <>
                    <Plus size={16} color={colors.text} />
                    <Text style={styles.followButtonText}>Follow</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <MessageCircle size={16} color={colors.text} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.tracksContainer}>
          {userTracks.length > 0 ? (
            <TrackList 
              title={`Tracks by ${user.displayName}`} 
              tracks={userTracks}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No tracks yet</Text>
              <Text style={styles.emptyStateText}>
                This user hasn't uploaded any tracks yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {currentTrack && isMinimized && <MiniPlayer />}
      
      <FollowersModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        users={users.slice(0, 3)} // Mock followers
      />
      
      <FollowersModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        users={users.slice(1, 4)} // Mock following
      />
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
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginHorizontal: 8,
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
  profileHeader: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.cardElevated,
  },
  profileInfo: {
    alignItems: 'center',
  },
  displayName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  followingButton: {
    backgroundColor: colors.cardElevated,
  },
  followButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  messageButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  tracksContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
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