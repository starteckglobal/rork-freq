import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Mail, Bell, Clock, Volume2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import StyledButton from '@/components/StyledButton';

export default function EmailNotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    // Frequency settings
    immediate: true,
    daily: false,
    weekly: true,
    
    // Content types
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    playlists: true,
    
    // Time preferences
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    
    // Marketing
    newsletters: false,
    promotions: false,
    updates: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Your email notification preferences have been updated',
      [{ text: 'OK' }]
    );
  };

  const NotificationItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
  }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        {icon}
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.text}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Email Notifications',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Frequency</Text>
          <Text style={styles.sectionDescription}>
            Choose how often you want to receive email notifications
          </Text>

          <NotificationItem
            title="Immediate"
            description="Get notified as soon as something happens"
            value={notifications.immediate}
            onToggle={() => handleToggle('immediate')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Daily Digest"
            description="Receive a daily summary of activity"
            value={notifications.daily}
            onToggle={() => handleToggle('daily')}
            icon={<Clock size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Weekly Summary"
            description="Get a weekly roundup of your activity"
            value={notifications.weekly}
            onToggle={() => handleToggle('weekly')}
            icon={<Mail size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Types</Text>
          <Text style={styles.sectionDescription}>
            Choose which activities trigger email notifications
          </Text>

          <NotificationItem
            title="Likes & Hearts"
            description="When someone likes your tracks"
            value={notifications.likes}
            onToggle={() => handleToggle('likes')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Comments"
            description="When someone comments on your tracks"
            value={notifications.comments}
            onToggle={() => handleToggle('comments')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="New Followers"
            description="When someone starts following you"
            value={notifications.follows}
            onToggle={() => handleToggle('follows')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Messages"
            description="When you receive new direct messages"
            value={notifications.messages}
            onToggle={() => handleToggle('messages')}
            icon={<Mail size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Playlist Additions"
            description="When your tracks are added to playlists"
            value={notifications.playlists}
            onToggle={() => handleToggle('playlists')}
            icon={<Volume2 size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionDescription}>
            Pause notifications during specific hours
          </Text>

          <NotificationItem
            title="Enable Quiet Hours"
            description="No notifications between 10 PM and 8 AM"
            value={notifications.quietHours}
            onToggle={() => handleToggle('quietHours')}
            icon={<Clock size={20} color={colors.primary} />}
          />

          {notifications.quietHours && (
            <View style={styles.quietHoursInfo}>
              <Text style={styles.quietHoursText}>
                Quiet hours: 10:00 PM - 8:00 AM
              </Text>
              <Text style={styles.quietHoursSubtext}>
                You can customize these times in the main notification settings
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing & Updates</Text>
          <Text style={styles.sectionDescription}>
            Stay informed about FREQ updates and opportunities
          </Text>

          <NotificationItem
            title="Newsletters"
            description="Monthly newsletters with tips and features"
            value={notifications.newsletters}
            onToggle={() => handleToggle('newsletters')}
            icon={<Mail size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Promotions"
            description="Special offers and promotional content"
            value={notifications.promotions}
            onToggle={() => handleToggle('promotions')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <NotificationItem
            title="Product Updates"
            description="New features and app improvements"
            value={notifications.updates}
            onToggle={() => handleToggle('updates')}
            icon={<Bell size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.buttonContainer}>
          <StyledButton
            title="Save Preferences"
            onPress={handleSave}
            style={styles.saveButton}
          />
          
          <TouchableOpacity
            style={styles.unsubscribeButton}
            onPress={() => {
              Alert.alert(
                'Unsubscribe from All',
                'Are you sure you want to unsubscribe from all email notifications? You can always re-enable them later.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Unsubscribe',
                    style: 'destructive',
                    onPress: () => {
                      setNotifications(prev => 
                        Object.keys(prev).reduce((acc, key) => ({
                          ...acc,
                          [key]: false
                        }), {} as typeof prev)
                      );
                      Alert.alert('Success', 'You have been unsubscribed from all email notifications');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.unsubscribeText}>Unsubscribe from All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  quietHoursInfo: {
    backgroundColor: colors.cardElevated,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  quietHoursText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quietHoursSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  buttonContainer: {
    padding: 16,
  },
  saveButton: {
    marginBottom: 16,
  },
  unsubscribeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  unsubscribeText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});