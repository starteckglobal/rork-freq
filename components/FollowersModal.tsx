import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { User } from '@/types/audio';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { defaultAvatarUri } from '@/constants/images';

interface FollowersModalProps {
  visible: boolean;
  onClose: () => void;
  users: User[];
  title: string;
}

export default function FollowersModal({ visible, onClose, users, title }: FollowersModalProps) {
  const router = useRouter();
  const { isFollowing, followUser, unfollowUser, isLoggedIn, currentUser } = useUserStore();
  
  const handleUserPress = (userId: string) => {
    onClose();
    router.push(`/profile/${userId}`);
  };
  
  const handleFollowToggle = (userId: string) => {
    if (!isLoggedIn) return;
    
    if (isFollowing(userId)) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };
  
  const renderUser = ({ item }: { item: User }) => {
    const following = isFollowing(item.id);
    const isCurrentUser = currentUser?.id === item.id;
    
    return (
      <View style={styles.userItem}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => handleUserPress(item.id)}
        >
          <Image
            source={{ uri: item.avatarUrl || defaultAvatarUri }}
            style={styles.avatar}
          />
          <View style={styles.userTextInfo}>
            <Text style={styles.displayName}>{item.displayName}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </View>
        </TouchableOpacity>
        
        {isLoggedIn && !isCurrentUser && (
          <TouchableOpacity
            style={[
              styles.followButton,
              following && styles.followingButton
            ]}
            onPress={() => handleFollowToggle(item.id)}
          >
            <Text style={[
              styles.followButtonText,
              following && styles.followingButtonText
            ]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingVertical: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardElevated,
  },
  userTextInfo: {
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});