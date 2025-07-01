import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { UserRound, Plus, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { User } from '@/types/audio';
import { colors } from '@/constants/colors';
import { defaultAvatarUri } from '@/constants/images';
import { useUserStore } from '@/store/user-store';

interface UserCardProps {
  user: User;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export default function UserCard({ user, onPress }: UserCardProps) {
  const router = useRouter();
  const { isFollowing, followUser, unfollowUser } = useUserStore();
  const [following, setFollowing] = useState(false);
  
  useEffect(() => {
    if (user && user.id) {
      setFollowing(isFollowing(user.id));
    }
  }, [user, isFollowing]);
  
  if (!user || !user.id) return null;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/profile/${user.id}`);
    }
  };
  
  const handleFollow = (e: any) => {
    e.stopPropagation();
    if (following) {
      unfollowUser(user.id);
      setFollowing(false);
    } else {
      followUser(user.id);
      setFollowing(true);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {user.avatarUrl ? (
        <Image 
          source={{ uri: user.avatarUrl || defaultAvatarUri }} 
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <UserRound size={24} color={colors.textSecondary} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.displayName} numberOfLines={1}>{user.displayName}</Text>
        <Text style={styles.username} numberOfLines={1}>@{user.username}</Text>
        <Text style={styles.stats}>{user.tracksCount || 0} tracks · {user.followers?.length || 0} followers</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.followButton, following && styles.followingButton]}
        onPress={handleFollow}
      >
        {following ? (
          <>
            <Check size={18} color={colors.text} />
            <Text style={styles.followText}>Following</Text>
          </>
        ) : (
          <>
            <Plus size={18} color={colors.text} />
            <Text style={styles.followText}>Follow</Text>
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.cardElevated,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  displayName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  stats: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
  followButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  followingButton: {
    backgroundColor: colors.cardElevated,
  },
  followText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});