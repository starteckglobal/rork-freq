import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/id';

export interface Notification {
  id: string;
  type: 'like' | 'playlist_add' | 'sync_accept' | 'opportunity' | 'upload' | 'plays' | 'message' | 'follow' | 'comment';
  title: string;
  message: string;
  userId?: string;
  trackId?: string;
  playlistId?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    trackTitle?: string;
    playlistName?: string;
    username?: string;
    playCount?: number;
    avatarUrl?: string;
  };
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
  
  // Notification generators for common events
  notifyTrackLike: (trackTitle: string, username: string, avatarUrl?: string) => void;
  notifyPlaylistAdd: (trackTitle: string, playlistName: string, username: string) => void;
  notifySyncAccept: (username: string, avatarUrl?: string) => void;
  notifyNewMessage: (username: string, message: string, avatarUrl?: string) => void;
  notifyTrackPlays: (trackTitle: string, playCount: number) => void;
  notifyNewFollower: (username: string, avatarUrl?: string) => void;
  notifyUploadFromFollower: (username: string, trackTitle: string, avatarUrl?: string) => void;
}

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like',
    message: 'Alex Johnson liked your track "Midnight Dreams"',
    userId: '2',
    trackId: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
    actionUrl: '/track/1',
    metadata: {
      trackTitle: 'Midnight Dreams',
      username: 'Alex Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '2',
    type: 'playlist_add',
    title: 'Added to Playlist',
    message: 'Sarah Chen added "Electric Pulse" to "Workout Beats"',
    userId: '3',
    trackId: '2',
    playlistId: 'playlist-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    actionUrl: '/playlist/playlist-1',
    metadata: {
      trackTitle: 'Electric Pulse',
      playlistName: 'Workout Beats',
      username: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '3',
    type: 'sync_accept',
    title: 'Sync Request Accepted',
    message: 'Marcus Williams accepted your sync collaboration request',
    userId: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    actionUrl: '/profile/4',
    metadata: {
      username: 'Marcus Williams',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '4',
    type: 'plays',
    title: 'Play Milestone',
    message: 'Your track "Neon Nights" reached 1,000 plays!',
    trackId: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    read: true,
    actionUrl: '/track/3',
    metadata: {
      trackTitle: 'Neon Nights',
      playCount: 1000
    }
  },
  {
    id: '5',
    type: 'follow',
    title: 'New Follower',
    message: 'Emma Davis started following you',
    userId: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    read: true,
    actionUrl: '/profile/5',
    metadata: {
      username: 'Emma Davis',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '6',
    type: 'upload',
    title: 'New Upload',
    message: 'DJ Phoenix uploaded a new track "Solar Flare"',
    userId: '6',
    trackId: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/track/4',
    metadata: {
      username: 'DJ Phoenix',
      trackTitle: 'Solar Flare',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    }
  }
];

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.read).length,
      
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: generateId(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markAsRead: (notificationId) => {
        set(state => {
          const notifications = state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          );
          
          const unreadCount = notifications.filter(n => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },
      
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        }));
      },
      
      deleteNotification: (notificationId) => {
        set(state => {
          const notifications = state.notifications.filter(n => n.id !== notificationId);
          const unreadCount = notifications.filter(n => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },
      
      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      getUnreadCount: () => {
        return get().unreadCount;
      },
      
      // Notification generators
      notifyTrackLike: (trackTitle, username, avatarUrl) => {
        get().addNotification({
          type: 'like',
          title: 'New Like',
          message: `${username} liked your track "${trackTitle}"`,
          actionUrl: '/profile',
          metadata: { trackTitle, username, avatarUrl }
        });
      },
      
      notifyPlaylistAdd: (trackTitle, playlistName, username) => {
        get().addNotification({
          type: 'playlist_add',
          title: 'Added to Playlist',
          message: `${username} added "${trackTitle}" to "${playlistName}"`,
          actionUrl: '/profile',
          metadata: { trackTitle, playlistName, username }
        });
      },
      
      notifySyncAccept: (username, avatarUrl) => {
        get().addNotification({
          type: 'sync_accept',
          title: 'Sync Request Accepted',
          message: `${username} accepted your sync collaboration request`,
          actionUrl: '/synclab',
          metadata: { username, avatarUrl }
        });
      },
      
      notifyNewMessage: (username, message, avatarUrl) => {
        get().addNotification({
          type: 'message',
          title: 'New Message',
          message: `${username}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
          actionUrl: '/messages',
          metadata: { username, avatarUrl }
        });
      },
      
      notifyTrackPlays: (trackTitle, playCount) => {
        const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
        if (milestones.includes(playCount)) {
          get().addNotification({
            type: 'plays',
            title: 'Play Milestone',
            message: `Your track "${trackTitle}" reached ${playCount.toLocaleString()} plays!`,
            actionUrl: '/analytics',
            metadata: { trackTitle, playCount }
          });
        }
      },
      
      notifyNewFollower: (username, avatarUrl) => {
        get().addNotification({
          type: 'follow',
          title: 'New Follower',
          message: `${username} started following you`,
          actionUrl: '/profile',
          metadata: { username, avatarUrl }
        });
      },
      
      notifyUploadFromFollower: (username, trackTitle, avatarUrl) => {
        get().addNotification({
          type: 'upload',
          title: 'New Upload',
          message: `${username} uploaded a new track "${trackTitle}"`,
          actionUrl: '/profile',
          metadata: { username, trackTitle, avatarUrl }
        });
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);