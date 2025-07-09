import { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notifications-store';
import { useUserStore } from '@/store/user-store';

// Simulate live notifications for demo purposes
export const useNotificationSimulator = () => {
  const { isLoggedIn } = useUserStore();
  const {
    notifyTrackPlays,
    notifyNewMessage,
    notifySyncAccept,
    notifyUploadFromFollower,
  } = useNotificationsStore();

  useEffect(() => {
    if (!isLoggedIn) return;

    // Simulate random notifications
    const intervals: ReturnType<typeof setInterval>[] = [];

    // Simulate play count milestones
    const playNotificationInterval = setInterval(() => {
      const tracks = [
        { id: '1', title: 'Midnight Dreams' },
        { id: '2', title: 'Electric Pulse' },
        { id: '3', title: 'Neon Nights' },
      ];
      
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      const milestones = [100, 500, 1000, 5000];
      const randomMilestone = milestones[Math.floor(Math.random() * milestones.length)];
      
      // 10% chance of triggering a play milestone notification
      if (Math.random() < 0.1) {
        notifyTrackPlays(randomTrack.title, randomMilestone);
      }
    }, 30000); // Check every 30 seconds

    // Simulate new messages
    const messageNotificationInterval = setInterval(() => {
      const messages = [
        { user: 'Alex Johnson', message: 'Great track! Love the beat drop.' },
        { user: 'Sarah Chen', message: 'Would you be interested in a collab?' },
        { user: 'Marcus Williams', message: 'Your latest release is fire! 🔥' },
        { user: 'Emma Davis', message: 'Thanks for the follow back!' },
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // 5% chance of triggering a new message notification
      if (Math.random() < 0.05) {
        notifyNewMessage(
          randomMessage.user,
          randomMessage.message,
          `https://images.unsplash.com/photo-150${Math.floor(Math.random() * 9)}003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`
        );
      }
    }, 45000); // Check every 45 seconds

    // Simulate sync accepts
    const syncNotificationInterval = setInterval(() => {
      const users = [
        { name: 'DJ Phoenix', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
        { name: 'Beat Master', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { name: 'Sound Wave', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      ];
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      // 3% chance of triggering a sync accept notification
      if (Math.random() < 0.03) {
        notifySyncAccept(randomUser.name, randomUser.avatar);
      }
    }, 60000); // Check every minute

    // Simulate follower uploads
    const uploadNotificationInterval = setInterval(() => {
      const uploads = [
        { user: 'DJ Phoenix', track: 'Solar Flare', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
        { user: 'Beat Master', track: 'Thunder Storm', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { user: 'Sound Wave', track: 'Ocean Waves', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      ];
      
      const randomUpload = uploads[Math.floor(Math.random() * uploads.length)];
      
      // 4% chance of triggering an upload notification
      if (Math.random() < 0.04) {
        notifyUploadFromFollower(randomUpload.user, randomUpload.track, randomUpload.avatar);
      }
    }, 90000); // Check every 1.5 minutes

    intervals.push(
      playNotificationInterval,
      messageNotificationInterval,
      syncNotificationInterval,
      uploadNotificationInterval
    );

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isLoggedIn, notifyTrackPlays, notifyNewMessage, notifySyncAccept, notifyUploadFromFollower]);
};