import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  User, 
  Lock, 
  Bell, 
  Volume2, 
  Globe, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Edit,
  Shield,
  BarChart,
  Wifi,
  Download,
  Trash2,
  Moon,
  Sun,
  Check,
  X,
  AlertCircle,
  Settings,
  Mail,
  Eye,
  Users,
  Headphones,
  Type,
  FileText,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/user-store';
import { defaultAvatarUri } from '@/constants/images';
import { settingsService } from '@/services/settings';
import { 
  usePrivacySettings, 
  useNotificationSettings, 
  usePlaybackSettings, 
  useAccessibilitySettings,
  use2FASettings
} from '@/hooks/useSettings';
import { analytics } from '@/services/analytics';

export default function SettingsScreen() {
  const router = useRouter();
  const { isLoggedIn, currentUser, logout } = useUserStore();
  
  // Settings hooks
  const { 
    settings: privacySettings, 
    loading: privacyLoading, 
    updateSettings: updatePrivacySettings 
  } = usePrivacySettings();
  
  const { 
    settings: notificationSettings, 
    loading: notificationsLoading, 
    updateSettings: updateNotificationSettings 
  } = useNotificationSettings();
  
  const { 
    settings: playbackSettings, 
    loading: playbackLoading, 
    updateSettings: updatePlaybackSettings 
  } = usePlaybackSettings();
  
  const {
    isEnabled: is2FAEnabled,
    method: twoFactorMethod,
    loading: twoFactorLoading,
    enable2FA,
    disable2FA
  } = use2FASettings();
  
  // Local state
  const [notifications, setNotifications] = useState(true);
  const { isDark, toggleTheme, colors: themeColors } = useColorScheme();
  const [autoplay, setAutoplay] = useState(true);
  const [downloadOnWifi, setDownloadOnWifi] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showPlaybackSettings, setShowPlaybackSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Initialize local state from settings
  useEffect(() => {
    if (notificationSettings) {
      setNotifications(notificationSettings.pushEnabled);
    }
    
    if (playbackSettings) {
      setAutoplay(playbackSettings.autoplay);
      setDownloadOnWifi(playbackSettings.wifiOnlyDownloads);
    }
  }, [notificationSettings, playbackSettings]);
  
  // Track screen view
  useEffect(() => {
    analytics.track('screen_view', { 
      screen_name: 'Settings',
      is_logged_in: isLoggedIn
    });
  }, [isLoggedIn]);
  
  // Handle notifications toggle
  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    
    try {
      setIsSaving(true);
      const success = await updateNotificationSettings({ pushEnabled: value });
      
      if (success) {
        setSaveSuccess('Notification settings updated');
        
        // Track settings change
        analytics.track('settings_updated', {
          setting_type: 'notifications',
          setting_name: 'push_notifications',
          setting_value: value
        });
      } else {
        setSaveError('Failed to update notification settings');
      }
    } catch (error) {
      setSaveError('An error occurred while updating settings');
      console.error('Error updating notification settings:', error);
    } finally {
      setIsSaving(false);
      
      // Clear success/error messages after a delay
      setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 3000);
    }
  };
  
  // Handle autoplay toggle
  const handleAutoplayToggle = async (value: boolean) => {
    setAutoplay(value);
    
    try {
      setIsSaving(true);
      const success = await updatePlaybackSettings({ autoplay: value });
      
      if (success) {
        setSaveSuccess('Playback settings updated');
        
        // Track settings change
        analytics.track('settings_updated', {
          setting_type: 'playback',
          setting_name: 'autoplay',
          setting_value: value
        });
      } else {
        setSaveError('Failed to update playback settings');
      }
    } catch (error) {
      setSaveError('An error occurred while updating settings');
      console.error('Error updating playback settings:', error);
    } finally {
      setIsSaving(false);
      
      // Clear success/error messages after a delay
      setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 3000);
    }
  };
  
  // Handle download on wifi toggle
  const handleDownloadOnWifiToggle = async (value: boolean) => {
    setDownloadOnWifi(value);
    
    try {
      setIsSaving(true);
      const success = await updatePlaybackSettings({ wifiOnlyDownloads: value });
      
      if (success) {
        setSaveSuccess('Download settings updated');
        
        // Track settings change
        analytics.track('settings_updated', {
          setting_type: 'downloads',
          setting_name: 'wifi_only',
          setting_value: value
        });
      } else {
        setSaveError('Failed to update download settings');
      }
    } catch (error) {
      setSaveError('An error occurred while updating settings');
      console.error('Error updating download settings:', error);
    } finally {
      setIsSaving(false);
      
      // Clear success/error messages after a delay
      setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 3000);
    }
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = async (value: boolean) => {
    await toggleTheme();
    
    // Track settings change
    analytics.track('settings_updated', {
      setting_type: 'appearance',
      setting_name: 'dark_mode',
      setting_value: value
    });
  };
  
  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    try {
      setIsSaving(true);
      
      if (is2FAEnabled) {
        // Confirm before disabling 2FA
        Alert.alert(
          "Disable 2FA",
          "Are you sure you want to disable two-factor authentication? This will make your account less secure.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Disable", 
              style: "destructive",
              onPress: async () => {
                const success = await disable2FA();
                
                if (success) {
                  setSaveSuccess('Two-factor authentication disabled');
                  
                  // Track settings change
                  analytics.track('security_updated', {
                    setting_name: '2fa',
                    action: 'disabled'
                  });
                } else {
                  setSaveError('Failed to disable two-factor authentication');
                }
                
                setIsSaving(false);
              }
            }
          ]
        );
        return;
      }
      
      // Enable 2FA - show method selection
      Alert.alert(
        "Enable 2FA",
        "Choose your preferred authentication method:",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Authenticator App", 
            onPress: async () => {
              const result = await enable2FA('2fa_app');
              
              if (result.success) {
                setSaveSuccess('Two-factor authentication enabled');
                
                // Show the secret key for the authenticator app
                if (result.secret) {
                  Alert.alert(
                    "Setup Authenticator App",
                    `Use this code in your authenticator app: ${result.secret}`,
                    [{ text: "OK" }]
                  );
                }
                
                // Track settings change
                analytics.track('security_updated', {
                  setting_name: '2fa',
                  action: 'enabled',
                  method: 'authenticator_app'
                });
              } else {
                setSaveError('Failed to enable two-factor authentication');
              }
              
              setIsSaving(false);
            }
          },
          { 
            text: "SMS", 
            onPress: async () => {
              const result = await enable2FA('sms');
              
              if (result.success) {
                setSaveSuccess('Two-factor authentication enabled');
                
                // Track settings change
                analytics.track('security_updated', {
                  setting_name: '2fa',
                  action: 'enabled',
                  method: 'sms'
                });
              } else {
                setSaveError('Failed to enable two-factor authentication');
              }
              
              setIsSaving(false);
            }
          }
        ]
      );
    } catch (error) {
      setSaveError('An error occurred while updating 2FA settings');
      console.error('Error updating 2FA settings:', error);
      setIsSaving(false);
    }
  };
  
  // Handle change password
  const handleChangePassword = () => {
    router.push('/settings/change-password');
  };
  
  // Handle email preferences
  const handleEmailPreferences = () => {
    router.push('/settings/email-preferences');
  };
  
  // Handle blocked users
  const handleBlockedUsers = () => {
    router.push('/settings/blocked-users');
  };
  
  // Handle audio quality
  const handleAudioQuality = () => {
    Alert.alert(
      "Audio Quality",
      "Choose your preferred audio quality:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Low (96 kbps)", 
          onPress: () => updatePlaybackSettings({ streamingQuality: 'low' })
        },
        { 
          text: "Normal (128 kbps)", 
          onPress: () => updatePlaybackSettings({ streamingQuality: 'normal' })
        },
        { 
          text: "High (320 kbps)", 
          onPress: () => updatePlaybackSettings({ streamingQuality: 'high' })
        },
        { 
          text: "Ultra (Lossless)", 
          onPress: () => updatePlaybackSettings({ streamingQuality: 'ultra' })
        }
      ]
    );
  };
  
  // Handle equalizer
  const handleEqualizer = () => {
    router.push('/settings/equalizer');
  };
  
  // Handle storage location
  const handleStorageLocation = () => {
    Alert.alert(
      "Storage Location",
      "Choose where to store downloaded music:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Internal Storage", 
          onPress: () => updatePlaybackSettings({ downloadLocation: 'internal' })
        },
        { 
          text: "External Storage", 
          onPress: () => updatePlaybackSettings({ downloadLocation: 'external' })
        }
      ]
    );
  };
  
  // Handle text size
  const handleTextSize = () => {
    Alert.alert(
      "Text Size",
      "Choose your preferred text size:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Small", onPress: () => console.log('Text size: Small') },
        { text: "Medium", onPress: () => console.log('Text size: Medium') },
        { text: "Large", onPress: () => console.log('Text size: Large') },
        { text: "Extra Large", onPress: () => console.log('Text size: Extra Large') }
      ]
    );
  };
  
  // Handle audience insights
  const handleAudienceInsights = () => {
    router.push('/(tabs)/synclab');
  };
  
  // Handle revenue reports
  const handleRevenueReports = () => {
    router.push('/(tabs)/synclab');
  };
  
  // Handle email notifications
  const handleEmailNotifications = () => {
    router.push('/settings/email-notifications');
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            // Track logout event
            analytics.track('user_logout');
            
            logout();
            router.replace('/(tabs)');
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            // Track account deletion
            analytics.track('account_deleted');
            
            // In a real app, this would call an API to delete the account
            logout();
            router.push('/');
            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Your data export has been prepared. In a real app, this would provide a download link.",
      [{ text: "OK" }]
    );
    
    // Track data export
    analytics.track('data_exported');
  };
  
  const handleClearCache = async () => {
    try {
      setIsSaving(true);
      
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess('Cache cleared successfully');
      
      // Track cache cleared
      analytics.track('cache_cleared');
    } catch (error) {
      setSaveError('Failed to clear cache');
      console.error('Error clearing cache:', error);
    } finally {
      setIsSaving(false);
      
      // Clear success/error messages after a delay
      setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 3000);
    }
  };
  
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <Stack.Screen options={{ 
          title: 'Settings',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        
        <View style={dynamicStyles.notLoggedIn}>
          <Text style={dynamicStyles.notLoggedInTitle}>Sign in to access settings</Text>
          <Text style={dynamicStyles.notLoggedInText}>
            You need to be logged in to view and change your settings
          </Text>
          <TouchableOpacity 
            style={dynamicStyles.loginButton}
            onPress={() => router.push('/')}
          >
            <Text style={dynamicStyles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const isLoading = privacyLoading || notificationsLoading || playbackLoading || twoFactorLoading;
  const dynamicStyles = createStyles(themeColors);
  
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Stack.Screen options={{ 
        title: 'Settings',
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerTitleStyle: {
          color: themeColors.text,
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      }} />
      
      {isLoading ? (
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading settings...</Text>
        </View>
      ) : (
        <ScrollView style={dynamicStyles.scrollView}>
          {/* Status Messages */}
          {saveSuccess && (
            <View style={dynamicStyles.successMessage}>
              <Check size={16} color="#4CAF50" />
              <Text style={dynamicStyles.successMessageText}>{saveSuccess}</Text>
            </View>
          )}
          
          {saveError && (
            <View style={dynamicStyles.errorMessage}>
              <AlertCircle size={16} color={themeColors.error} />
              <Text style={dynamicStyles.errorMessageText}>{saveError}</Text>
            </View>
          )}
          
          {/* User Profile Section */}
          <View style={dynamicStyles.profileSection}>
            <Image 
              source={{ uri: currentUser?.avatarUrl || defaultAvatarUri }}
              style={dynamicStyles.profileImage}
            />
            <View style={dynamicStyles.profileInfo}>
              <Text style={dynamicStyles.profileName}>{currentUser?.displayName}</Text>
              <Text style={dynamicStyles.profileUsername}>@{currentUser?.username}</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.editProfileButton}
              onPress={() => router.push('/profile')}
              accessibilityLabel="Edit profile"
              accessibilityHint="Navigate to profile editing screen"
            >
              <Edit size={20} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Account Settings */}
          <TouchableOpacity 
            style={dynamicStyles.sectionHeader}
            onPress={() => setShowAccountSettings(!showAccountSettings)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showAccountSettings }}
            accessibilityLabel="Account Settings"
          >
            <View style={dynamicStyles.sectionHeaderLeft}>
              <User size={20} color={themeColors.primary} />
              <Text style={dynamicStyles.sectionTitle}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color={themeColors.textSecondary} style={showAccountSettings ? dynamicStyles.rotatedChevron : undefined} />
          </TouchableOpacity>
          
          {showAccountSettings && (
            <View style={dynamicStyles.sectionContent}>
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={() => router.push('/profile')}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Edit size={18} color={themeColors.textSecondary} />
                  <Text style={dynamicStyles.settingLabel}>Edit Profile</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleChangePassword}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Lock size={18} color={themeColors.textSecondary} />
                  <Text style={styles.settingLabel}>Change Password</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleEmailPreferences}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Mail size={18} color={themeColors.textSecondary} />
                  <Text style={styles.settingLabel}>Email Preferences</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleExportData}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Download size={18} color={themeColors.textSecondary} />
                  <Text style={styles.settingLabel}>Export Your Data</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, styles.dangerItem]}
                onPress={handleDeleteAccount}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Trash2 size={18} color={themeColors.error} />
                  <Text style={dynamicStyles.dangerText}>Delete Account</Text>
                </View>
                <ChevronRight size={18} color={themeColors.error} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Privacy & Security */}
          <TouchableOpacity 
            style={dynamicStyles.sectionHeader}
            onPress={() => setShowPrivacySettings(!showPrivacySettings)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showPrivacySettings }}
            accessibilityLabel="Privacy Settings"
          >
            <View style={dynamicStyles.sectionHeaderLeft}>
              <Shield size={20} color={themeColors.primary} />
              <Text style={styles.sectionTitle}>Privacy & Security</Text>
            </View>
            <ChevronRight size={20} color={themeColors.textSecondary} style={showPrivacySettings ? dynamicStyles.rotatedChevron : undefined} />
          </TouchableOpacity>
          
          {showPrivacySettings && (
            <View style={dynamicStyles.sectionContent}>
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={() => {
                  Alert.alert(
                    "Profile Visibility",
                    "Choose who can see your profile:",
                    [
                      { text: "Everyone", onPress: () => updatePrivacySettings({ profileVisibility: 'public' }) },
                      { text: "Followers Only", onPress: () => updatePrivacySettings({ profileVisibility: 'followers' }) },
                      { text: "Private", onPress: () => updatePrivacySettings({ profileVisibility: 'private' }) },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Eye size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Profile Visibility</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {privacySettings?.profileVisibility === 'public' ? 'Everyone' : 
                     privacySettings?.profileVisibility === 'followers' ? 'Followers Only' : 
                     privacySettings?.profileVisibility === 'private' ? 'Private' : 'Everyone'}
                  </Text>
                  <ChevronRight size={18} color={themeColors.textTertiary} />
                </View>
              </TouchableOpacity>
              
              <View style={styles.switchItem}>
                <View style={dynamicStyles.settingLeft}>
                  <Volume2 size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Show Listening Activity</Text>
                </View>
                <Switch
                  value={privacySettings?.showListeningActivity || false}
                  onValueChange={(value) => {
                    updatePrivacySettings({ showListeningActivity: value });
                    
                    // Track settings change
                    analytics.track('privacy_setting_changed', {
                      setting: 'show_listening_activity',
                      value: value
                    });
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.text}
                  disabled={isSaving}
                />
              </View>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={() => {
                  Alert.alert(
                    "Two-Factor Authentication",
                    is2FAEnabled 
                      ? `2FA is currently enabled using ${twoFactorMethod === '2fa_app' ? 'an authenticator app' : 'SMS'}.`
                      : "2FA is currently disabled. Enable it for additional security.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: is2FAEnabled ? "Disable 2FA" : "Enable 2FA", 
                        onPress: handle2FAToggle
                      }
                    ]
                  );
                }}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Shield size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                  <ChevronRight size={18} color={themeColors.textTertiary} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleBlockedUsers}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Users size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Blocked Users</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <View style={styles.switchItem}>
                <View style={dynamicStyles.settingLeft}>
                  <BarChart size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Data Collection</Text>
                </View>
                <Switch
                  value={privacySettings?.dataCollection || false}
                  onValueChange={(value) => {
                    updatePrivacySettings({ dataCollection: value });
                    
                    // Update analytics consent
                    analytics.setTrackingConsent(value);
                    
                    // Track settings change (only if consent is still granted)
                    if (value) {
                      analytics.track('privacy_setting_changed', {
                        setting: 'data_collection',
                        value: value
                      });
                    }
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.text}
                  disabled={isSaving}
                />
              </View>
            </View>
          )}
          
          {/* Analytics */}
          <TouchableOpacity 
            style={dynamicStyles.sectionHeader}
            onPress={() => setShowAnalytics(!showAnalytics)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showAnalytics }}
            accessibilityLabel="Analytics"
          >
            <View style={dynamicStyles.sectionHeaderLeft}>
              <BarChart size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Analytics</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} style={showAnalytics ? styles.rotatedChevron : undefined} />
          </TouchableOpacity>
          
          {showAnalytics && (
            <View style={dynamicStyles.sectionContent}>
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={() => router.push('/analytics')}
              >
                <View style={dynamicStyles.settingLeft}>
                  <BarChart size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Track Performance</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleAudienceInsights}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Users size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Audience Insights</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleRevenueReports}
              >
                <View style={dynamicStyles.settingLeft}>
                  <BarChart size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Revenue Reports</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Notifications */}
          <View style={styles.sectionHeader}>
            <View style={dynamicStyles.sectionHeaderLeft}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.switchItem}>
              <View style={styles.settingLeft}>
                <Bell size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
                disabled={isSaving}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleEmailNotifications}
            >
              <View style={styles.settingLeft}>
                <Mail size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Email Notifications</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
          
          {/* Playback */}
          <TouchableOpacity 
            style={dynamicStyles.sectionHeader}
            onPress={() => setShowPlaybackSettings(!showPlaybackSettings)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showPlaybackSettings }}
            accessibilityLabel="Playback Settings"
          >
            <View style={dynamicStyles.sectionHeaderLeft}>
              <Volume2 size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Playback</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} style={showPlaybackSettings ? styles.rotatedChevron : undefined} />
          </TouchableOpacity>
          
          {showPlaybackSettings && (
            <View style={dynamicStyles.sectionContent}>
              <View style={styles.switchItem}>
                <View style={dynamicStyles.settingLeft}>
                  <Volume2 size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Autoplay</Text>
                </View>
                <Switch
                  value={autoplay}
                  onValueChange={handleAutoplayToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.text}
                  disabled={isSaving}
                />
              </View>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleAudioQuality}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Headphones size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Audio Quality</Text>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {playbackSettings?.streamingQuality === 'low' ? 'Low' :
                     playbackSettings?.streamingQuality === 'normal' ? 'Normal' :
                     playbackSettings?.streamingQuality === 'high' ? 'High' :
                     playbackSettings?.streamingQuality === 'ultra' ? 'Ultra' : 'High'}
                  </Text>
                  <ChevronRight size={18} color={themeColors.textTertiary} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.settingItem}
                onPress={handleEqualizer}
              >
                <View style={dynamicStyles.settingLeft}>
                  <Settings size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Equalizer</Text>
                </View>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </TouchableOpacity>
              
              <View style={styles.switchItem}>
                <View style={dynamicStyles.settingLeft}>
                  <Volume2 size={18} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Volume Normalization</Text>
                </View>
                <Switch
                  value={playbackSettings?.volumeNormalization || false}
                  onValueChange={(value) => {
                    updatePlaybackSettings({ volumeNormalization: value });
                    
                    // Track settings change
                    analytics.track('playback_setting_changed', {
                      setting: 'volume_normalization',
                      value: value
                    });
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.text}
                  disabled={isSaving}
                />
              </View>
            </View>
          )}
          
          {/* Downloads */}
          <View style={styles.sectionHeader}>
            <View style={dynamicStyles.sectionHeaderLeft}>
              <Download size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Downloads</Text>
            </View>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.switchItem}>
              <View style={styles.settingLeft}>
                <Wifi size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Download on Wi-Fi Only</Text>
              </View>
              <Switch
                value={downloadOnWifi}
                onValueChange={handleDownloadOnWifiToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
                disabled={isSaving}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleStorageLocation}
            >
              <View style={styles.settingLeft}>
                <Download size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Storage Location</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>
                  {playbackSettings?.downloadLocation === 'external' ? 'External Storage' : 'Internal Storage'}
                </Text>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleClearCache}
              disabled={isSaving}
            >
              <View style={styles.settingLeft}>
                <Trash2 size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Clear Cache</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>256 MB</Text>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Appearance */}
          <View style={styles.sectionHeader}>
            <View style={dynamicStyles.sectionHeaderLeft}>
              {isDark ? (
                <Moon size={20} color={themeColors.primary} />
              ) : (
                <Sun size={20} color={themeColors.primary} />
              )}
              <Text style={styles.sectionTitle}>Appearance</Text>
            </View>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.switchItem}>
              <View style={styles.settingLeft}>
                {isDark ? (
                  <Moon size={18} color={themeColors.textSecondary} />
                ) : (
                  <Sun size={18} color={themeColors.textSecondary} />
                )}
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: themeColors.border, true: themeColors.primary }}
                thumbColor={themeColors.text}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleTextSize}
            >
              <View style={styles.settingLeft}>
                <Type size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Text Size</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>Medium</Text>
                <ChevronRight size={18} color={themeColors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* About */}
          <View style={styles.sectionHeader}>
            <View style={dynamicStyles.sectionHeaderLeft}>
              <Info size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
          </View>
          
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  "Terms of Service",
                  "This would show the Terms of Service in a real app.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={styles.settingLeft}>
                <FileText size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  "Privacy Policy",
                  "This would show the Privacy Policy in a real app.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={styles.settingLeft}>
                <Shield size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Info size={18} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
          
          {/* Logout */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.text} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successMessageText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorMessageText: {
    color: colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileUsername: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  rotatedChevron: {
    transform: [{ rotate: '90deg' }],
  },
  sectionContent: {
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  versionText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: colors.error,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  notLoggedInText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

const createStyles = (colors: any) => StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successMessageText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorMessageText: {
    color: colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileUsername: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  rotatedChevron: {
    transform: [{ rotate: '90deg' }],
  },
  sectionContent: {
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  versionText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: colors.error,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  notLoggedInText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});