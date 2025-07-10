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
import { ChevronLeft, Mail, Bell, Music, Users, BarChart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import StyledButton from '@/components/StyledButton';

export default function EmailPreferencesScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    newFollowers: true,
    trackLikes: true,
    playlistAdds: true,
    comments: true,
    messages: true,
    syncOpportunities: true,
    weeklyDigest: true,
    monthlyReport: false,
    promotionalEmails: false,
    productUpdates: true,
    securityAlerts: true,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Your email preferences have been updated',
      [{ text: 'OK' }]
    );
  };

  const PreferenceItem = ({ 
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
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceLeft}>
        {icon}
        <View style={styles.preferenceText}>
          <Text style={styles.preferenceTitle}>{title}</Text>
          <Text style={styles.preferenceDescription}>{description}</Text>
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
          title: 'Email Preferences',
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
          <Text style={styles.sectionTitle}>Activity Notifications</Text>
          <Text style={styles.sectionDescription}>
            Get notified about activity on your profile and tracks
          </Text>

          <PreferenceItem
            title="New Followers"
            description="When someone follows you"
            value={preferences.newFollowers}
            onToggle={() => handleToggle('newFollowers')}
            icon={<Users size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Track Likes"
            description="When someone likes your tracks"
            value={preferences.trackLikes}
            onToggle={() => handleToggle('trackLikes')}
            icon={<Music size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Playlist Adds"
            description="When your tracks are added to playlists"
            value={preferences.playlistAdds}
            onToggle={() => handleToggle('playlistAdds')}
            icon={<Music size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Comments"
            description="When someone comments on your tracks"
            value={preferences.comments}
            onToggle={() => handleToggle('comments')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Messages"
            description="When you receive new messages"
            value={preferences.messages}
            onToggle={() => handleToggle('messages')}
            icon={<Mail size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SyncLab & Opportunities</Text>
          <Text style={styles.sectionDescription}>
            Professional opportunities and sync placements
          </Text>

          <PreferenceItem
            title="Sync Opportunities"
            description="New sync placement opportunities"
            value={preferences.syncOpportunities}
            onToggle={() => handleToggle('syncOpportunities')}
            icon={<BarChart size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Digest & Reports</Text>
          <Text style={styles.sectionDescription}>
            Regular summaries of your activity and performance
          </Text>

          <PreferenceItem
            title="Weekly Digest"
            description="Weekly summary of your activity"
            value={preferences.weeklyDigest}
            onToggle={() => handleToggle('weeklyDigest')}
            icon={<Mail size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Monthly Report"
            description="Detailed monthly performance report"
            value={preferences.monthlyReport}
            onToggle={() => handleToggle('monthlyReport')}
            icon={<BarChart size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing & Updates</Text>
          <Text style={styles.sectionDescription}>
            Product updates and promotional content
          </Text>

          <PreferenceItem
            title="Promotional Emails"
            description="Special offers and promotions"
            value={preferences.promotionalEmails}
            onToggle={() => handleToggle('promotionalEmails')}
            icon={<Mail size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Product Updates"
            description="New features and app updates"
            value={preferences.productUpdates}
            onToggle={() => handleToggle('productUpdates')}
            icon={<Bell size={20} color={colors.primary} />}
          />

          <PreferenceItem
            title="Security Alerts"
            description="Important security notifications"
            value={preferences.securityAlerts}
            onToggle={() => handleToggle('securityAlerts')}
            icon={<Bell size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.buttonContainer}>
          <StyledButton
            title="Save Preferences"
            onPress={handleSave}
            style={styles.saveButton}
          />
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
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  preferenceDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});