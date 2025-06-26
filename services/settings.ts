import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { analytics } from './analytics';

// Types
export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showListeningActivity: boolean;
  showPlaylists: boolean;
  showFollowing: boolean;
  showFollowers: boolean;
  messagingPrivacy: 'everyone' | 'followers' | 'verified' | 'none';
  readReceipts: boolean;
  typingIndicators: boolean;
  locationPrivacy: boolean;
  dataCollection: boolean;
  personalization: boolean;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newFollowers: boolean;
  comments: boolean;
  messages: boolean;
  newReleases: boolean;
  playlistAdditions: boolean;
  weeklyDigest: boolean;
  specialOffers: boolean;
  artistUpdates: boolean;
  securityAlerts: boolean;
}

export interface PlaybackSettings {
  autoplay: boolean;
  streamingQuality: 'low' | 'normal' | 'high' | 'ultra';
  downloadQuality: 'low' | 'normal' | 'high';
  wifiOnlyDownloads: boolean;
  crossfade: boolean;
  crossfadeDuration: number;
  gapless: boolean;
  volumeNormalization: boolean;
  equalizerEnabled: boolean;
  equalizerPreset: string;
  downloadLocation: 'internal' | 'external';
  maxDownloadStorage: number;
}

export interface AccessibilitySettings {
  textSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindMode: boolean;
  monoAudio: boolean;
  screenReader: boolean;
  voiceControl: boolean;
  simplifiedInterface: boolean;
}

export interface LanguageSettings {
  appLanguage: string;
  contentLanguage: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 'sunday' | 'monday';
  measurementSystem: 'imperial' | 'metric';
}

export interface UserSettings {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  playback: PlaybackSettings;
  accessibility: AccessibilitySettings;
  language: LanguageSettings;
}

// Default settings
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'public',
  showListeningActivity: true,
  showPlaylists: true,
  showFollowing: true,
  showFollowers: true,
  messagingPrivacy: 'everyone',
  readReceipts: true,
  typingIndicators: true,
  locationPrivacy: false,
  dataCollection: true,
  personalization: true,
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  newFollowers: true,
  comments: true,
  messages: true,
  newReleases: true,
  playlistAdditions: true,
  weeklyDigest: true,
  specialOffers: false,
  artistUpdates: true,
  securityAlerts: true,
};

const DEFAULT_PLAYBACK_SETTINGS: PlaybackSettings = {
  autoplay: true,
  streamingQuality: 'high',
  downloadQuality: 'high',
  wifiOnlyDownloads: true,
  crossfade: false,
  crossfadeDuration: 0,
  gapless: true,
  volumeNormalization: true,
  equalizerEnabled: false,
  equalizerPreset: 'flat',
  downloadLocation: 'internal',
  maxDownloadStorage: 8192, // 8GB in MB
};

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  textSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  colorBlindMode: false,
  monoAudio: false,
  screenReader: false,
  voiceControl: false,
  simplifiedInterface: false,
};

const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  appLanguage: 'en',
  contentLanguage: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  firstDayOfWeek: 'sunday',
  measurementSystem: 'imperial',
};

const DEFAULT_USER_SETTINGS: UserSettings = {
  privacy: DEFAULT_PRIVACY_SETTINGS,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  playback: DEFAULT_PLAYBACK_SETTINGS,
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
  language: DEFAULT_LANGUAGE_SETTINGS,
};

// Settings service class
class SettingsService {
  private settings: UserSettings | null = null;
  private initialized: boolean = false;
  
  // Initialize settings
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const storedSettings = await AsyncStorage.getItem('user_settings');
      
      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.settings = DEFAULT_USER_SETTINGS;
        await this.saveSettings();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('[Settings] Initialization error:', error);
      this.settings = DEFAULT_USER_SETTINGS;
      this.initialized = true;
    }
  }
  
  // Get all settings
  async getAllSettings(): Promise<UserSettings> {
    if (!this.initialized) await this.initialize();
    return this.settings || DEFAULT_USER_SETTINGS;
  }
  
  // Get privacy settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    if (!this.initialized) await this.initialize();
    return this.settings?.privacy || DEFAULT_PRIVACY_SETTINGS;
  }
  
  // Update privacy settings
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    this.settings = {
      ...this.settings!,
      privacy: {
        ...this.settings!.privacy,
        ...settings,
      },
    };
    
    await this.saveSettings();
    
    // Track settings change
    analytics.track('settings_update', {
      settings_type: 'privacy',
      updated_fields: Object.keys(settings),
    });
  }
  
  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    if (!this.initialized) await this.initialize();
    return this.settings?.notifications || DEFAULT_NOTIFICATION_SETTINGS;
  }
  
  // Update notification settings
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    this.settings = {
      ...this.settings!,
      notifications: {
        ...this.settings!.notifications,
        ...settings,
      },
    };
    
    await this.saveSettings();
    
    // Track settings change
    analytics.track('settings_update', {
      settings_type: 'notifications',
      updated_fields: Object.keys(settings),
    });
  }
  
  // Get playback settings
  async getPlaybackSettings(): Promise<PlaybackSettings> {
    if (!this.initialized) await this.initialize();
    return this.settings?.playback || DEFAULT_PLAYBACK_SETTINGS;
  }
  
  // Update playback settings
  async updatePlaybackSettings(settings: Partial<PlaybackSettings>): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    this.settings = {
      ...this.settings!,
      playback: {
        ...this.settings!.playback,
        ...settings,
      },
    };
    
    await this.saveSettings();
    
    // Track settings change
    analytics.track('settings_update', {
      settings_type: 'playback',
      updated_fields: Object.keys(settings),
    });
  }
  
  // Get accessibility settings
  async getAccessibilitySettings(): Promise<AccessibilitySettings> {
    if (!this.initialized) await this.initialize();
    return this.settings?.accessibility || DEFAULT_ACCESSIBILITY_SETTINGS;
  }
  
  // Update accessibility settings
  async updateAccessibilitySettings(settings: Partial<AccessibilitySettings>): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    this.settings = {
      ...this.settings!,
      accessibility: {
        ...this.settings!.accessibility,
        ...settings,
      },
    };
    
    await this.saveSettings();
    
    // Track settings change
    analytics.track('settings_update', {
      settings_type: 'accessibility',
      updated_fields: Object.keys(settings),
    });
  }
  
  // Get language settings
  async getLanguageSettings(): Promise<LanguageSettings> {
    if (!this.initialized) await this.initialize();
    return this.settings?.language || DEFAULT_LANGUAGE_SETTINGS;
  }
  
  // Update language settings
  async updateLanguageSettings(settings: Partial<LanguageSettings>): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    this.settings = {
      ...this.settings!,
      language: {
        ...this.settings!.language,
        ...settings,
      },
    };
    
    await this.saveSettings();
    
    // Track settings change
    analytics.track('settings_update', {
      settings_type: 'language',
      updated_fields: Object.keys(settings),
    });
  }
  
  // Reset all settings to default
  async resetAllSettings(): Promise<void> {
    this.settings = DEFAULT_USER_SETTINGS;
    await this.saveSettings();
    
    // Track settings reset
    analytics.track('settings_reset', {
      reset_type: 'all',
    });
  }
  
  // Reset specific settings category
  async resetSettingsCategory(category: keyof UserSettings): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    switch (category) {
      case 'privacy':
        this.settings = {
          ...this.settings!,
          privacy: DEFAULT_PRIVACY_SETTINGS,
        };
        break;
      case 'notifications':
        this.settings = {
          ...this.settings!,
          notifications: DEFAULT_NOTIFICATION_SETTINGS,
        };
        break;
      case 'playback':
        this.settings = {
          ...this.settings!,
          playback: DEFAULT_PLAYBACK_SETTINGS,
        };
        break;
      case 'accessibility':
        this.settings = {
          ...this.settings!,
          accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
        };
        break;
      case 'language':
        this.settings = {
          ...this.settings!,
          language: DEFAULT_LANGUAGE_SETTINGS,
        };
        break;
    }
    
    await this.saveSettings();
    
    // Track settings reset
    analytics.track('settings_reset', {
      reset_type: category,
    });
  }
  
  // Export user settings
  async exportSettings(): Promise<string> {
    if (!this.initialized) await this.initialize();
    
    // Track export
    analytics.track('settings_export');
    
    return JSON.stringify(this.settings);
  }
  
  // Import user settings
  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const parsedSettings = JSON.parse(settingsJson);
      
      // Validate settings structure
      if (!this.validateSettings(parsedSettings)) {
        return false;
      }
      
      this.settings = parsedSettings;
      await this.saveSettings();
      
      // Track import
      analytics.track('settings_import', {
        success: true,
      });
      
      return true;
    } catch (error) {
      console.error('[Settings] Import error:', error);
      
      // Track failed import
      analytics.track('settings_import', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return false;
    }
  }
  
  // Private methods
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('user_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[Settings] Save error:', error);
    }
  }
  
  private validateSettings(settings: any): boolean {
    // Basic validation - check if all required categories exist
    return (
      settings &&
      typeof settings === 'object' &&
      settings.privacy &&
      settings.notifications &&
      settings.playback &&
      settings.accessibility &&
      settings.language
    );
  }
  
  // Two-factor authentication methods
  async enable2FA(method: '2fa_app' | 'sms'): Promise<{ secret?: string; success: boolean }> {
    // In a real app, this would generate a secret key and QR code for 2FA app
    // or send a verification code via SMS
    
    // For this demo, we'll just simulate it
    const success = true;
    const secret = method === '2fa_app' ? 'ABCDEFGHIJKLMNOP' : undefined;
    
    if (success) {
      await AsyncStorage.setItem('2fa_enabled', 'true');
      await AsyncStorage.setItem('2fa_method', method);
      
      if (method === '2fa_app' && secret) {
        await AsyncStorage.setItem('2fa_secret', secret);
      }
      
      // Track 2FA enablement
      analytics.track('security_update', {
        action: '2fa_enabled',
        method,
      });
    }
    
    return { secret, success };
  }
  
  async disable2FA(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem('2fa_enabled');
      await AsyncStorage.removeItem('2fa_method');
      await AsyncStorage.removeItem('2fa_secret');
      
      // Track 2FA disablement
      analytics.track('security_update', {
        action: '2fa_disabled',
      });
      
      return true;
    } catch (error) {
      console.error('[Settings] Disable 2FA error:', error);
      return false;
    }
  }
  
  async is2FAEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('2fa_enabled');
    return enabled === 'true';
  }
  
  async get2FAMethod(): Promise<'2fa_app' | 'sms' | null> {
    const method = await AsyncStorage.getItem('2fa_method');
    return (method as '2fa_app' | 'sms' | null);
  }
  
  async generateBackupCodes(): Promise<string[]> {
    // In a real app, this would generate secure random codes
    // For this demo, we'll just use mock codes
    const codes = [
      '1234-5678',
      '2345-6789',
      '3456-7890',
      '4567-8901',
      '5678-9012',
      '6789-0123',
      '7890-1234',
      '8901-2345',
      '9012-3456',
      '0123-4567',
    ];
    
    await AsyncStorage.setItem('2fa_backup_codes', JSON.stringify(codes));
    
    // Track backup codes generation
    analytics.track('security_update', {
      action: 'backup_codes_generated',
    });
    
    return codes;
  }
  
  // Account security methods
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    // In a real app, this would verify the current password and update to the new one
    // For this demo, we'll just simulate it
    
    // Simulate password validation
    if (currentPassword === 'wrong') {
      return false;
    }
    
    // Track password change
    analytics.track('security_update', {
      action: 'password_changed',
    });
    
    return true;
  }
  
  async changeEmail(password: string, newEmail: string): Promise<boolean> {
    // In a real app, this would verify the password and update the email
    // For this demo, we'll just simulate it
    
    // Simulate password validation
    if (password === 'wrong') {
      return false;
    }
    
    // Track email change
    analytics.track('account_update', {
      action: 'email_changed',
    });
    
    return true;
  }
  
  // Storage management methods
  async getCacheSize(): Promise<number> {
    // In a real app, this would calculate the actual cache size
    // For this demo, we'll just return a mock value
    return 256; // 256 MB
  }
  
  async clearCache(): Promise<boolean> {
    // In a real app, this would clear the app's cache
    // For this demo, we'll just simulate it
    
    // Track cache clear
    analytics.track('storage_action', {
      action: 'cache_cleared',
    });
    
    return true;
  }
  
  async getDownloadSize(): Promise<number> {
    // In a real app, this would calculate the actual download size
    // For this demo, we'll just return a mock value
    return 1024; // 1 GB
  }
  
  async clearDownloads(): Promise<boolean> {
    // In a real app, this would delete all downloaded tracks
    // For this demo, we'll just simulate it
    
    // Track downloads clear
    analytics.track('storage_action', {
      action: 'downloads_cleared',
    });
    
    return true;
  }
}

// Create and export singleton instance
export const settingsService = new SettingsService();

// Initialize settings on import
settingsService.initialize().catch(error => {
  console.error('[Settings] Initialization error:', error);
});