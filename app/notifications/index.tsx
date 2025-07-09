import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Bell,
  Heart,
  Music,
  Users,
  MessageCircle,
  Play,
  Upload,
  ChevronLeft,
  MoreVertical,
  Check,
  Trash2,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useNotificationsStore, Notification } from '@/store/notifications-store';
import { useUserStore } from '@/store/user-store';
import { freqLogoUrl, defaultAvatarUri } from '@/constants/images';
import LoginModal from '@/components/LoginModal';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart size={20} color={colors.primary} />;
    case 'playlist_add':
      return <Music size={20} color={colors.secondary} />;
    case 'sync_accept':
      return <Users size={20} color={colors.accent} />;
    case 'message':
      return <MessageCircle size={20} color={colors.primary} />;
    case 'plays':
      return <Play size={20} color={colors.success} />;
    case 'follow':
      return <Users size={20} color={colors.primary} />;
    case 'upload':
      return <Upload size={20} color={colors.secondary} />;
    default:
      return <Bell size={20} color={colors.textSecondary} />;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { isLoggedIn, setShowLoginModal, showLoginModal } = useUserStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationsStore();

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read when tapped
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to the appropriate screen
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            {getNotificationIcon(item.type)}
          </View>
          
          {item.metadata?.avatarUrl && (
            <Image
              source={{ uri: item.metadata.avatarUrl }}
              style={styles.userAvatar}
            />
          )}
          
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(item.id)}
          >
            <Trash2 size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Notifications',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              color: colors.text,
              fontWeight: '600',
            },
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/')}>
                  <Image
                    source={{ uri: freqLogoUrl }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <View style={styles.loginPrompt}>
          <Bell size={60} color={colors.textSecondary} />
          <Text style={styles.loginPromptTitle}>Sign in to view notifications</Text>
          <Text style={styles.loginPromptText}>
            Stay updated with likes, follows, and activity on your music
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={styles.loginButtonText}>Login+</Text>
          </TouchableOpacity>
        </View>

        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
          },
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Image
                  source={{ uri: freqLogoUrl }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={markAllAsRead}
                >
                  <Check size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearAll}
              >
                <MoreVertical size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.content}>
        {notifications.length > 0 ? (
          <>
            {unreadCount > 0 && (
              <View style={styles.unreadHeader}>
                <Text style={styles.unreadHeaderText}>
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotificationItem}
              contentContainerStyle={styles.notificationsList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              You'll see likes, follows, and other activity here
            </Text>
          </View>
        )}
      </View>

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
  logo: {
    width: 32,
    height: 32,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  markAllButton: {
    padding: 8,
    marginRight: 8,
  },
  clearAllButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  unreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadHeaderText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  markAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
  },
  unreadNotification: {
    backgroundColor: colors.cardElevated,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginPromptTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  loginPromptText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});