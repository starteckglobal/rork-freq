import { useState, useEffect, useCallback } from 'react';
import { 
  settingsService, 
  PrivacySettings, 
  NotificationSettings, 
  PlaybackSettings, 
  AccessibilitySettings, 
  LanguageSettings 
} from '@/services/settings';

/**
 * Hook to manage privacy settings
 */
export function usePrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const privacySettings = await settingsService.getPrivacySettings();
        setSettings(privacySettings);
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = useCallback(async (newSettings: Partial<PrivacySettings>) => {
    try {
      await settingsService.updatePrivacySettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      return true;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return false;
    }
  }, []);
  
  return { settings, loading, updateSettings };
}

/**
 * Hook to manage notification settings
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationSettings = await settingsService.getNotificationSettings();
        setSettings(notificationSettings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      await settingsService.updateNotificationSettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }, []);
  
  return { settings, loading, updateSettings };
}

/**
 * Hook to manage playback settings
 */
export function usePlaybackSettings() {
  const [settings, setSettings] = useState<PlaybackSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const playbackSettings = await settingsService.getPlaybackSettings();
        setSettings(playbackSettings);
      } catch (error) {
        console.error('Error loading playback settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = useCallback(async (newSettings: Partial<PlaybackSettings>) => {
    try {
      await settingsService.updatePlaybackSettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      return true;
    } catch (error) {
      console.error('Error updating playback settings:', error);
      return false;
    }
  }, []);
  
  return { settings, loading, updateSettings };
}

/**
 * Hook to manage accessibility settings
 */
export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const accessibilitySettings = await settingsService.getAccessibilitySettings();
        setSettings(accessibilitySettings);
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = useCallback(async (newSettings: Partial<AccessibilitySettings>) => {
    try {
      await settingsService.updateAccessibilitySettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      return true;
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
      return false;
    }
  }, []);
  
  return { settings, loading, updateSettings };
}

/**
 * Hook to manage language settings
 */
export function useLanguageSettings() {
  const [settings, setSettings] = useState<LanguageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const languageSettings = await settingsService.getLanguageSettings();
        setSettings(languageSettings);
      } catch (error) {
        console.error('Error loading language settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = useCallback(async (newSettings: Partial<LanguageSettings>) => {
    try {
      await settingsService.updateLanguageSettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      return true;
    } catch (error) {
      console.error('Error updating language settings:', error);
      return false;
    }
  }, []);
  
  return { settings, loading, updateSettings };
}

/**
 * Hook to manage 2FA settings
 */
export function use2FASettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<'2fa_app' | 'sms' | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const enabled = await settingsService.is2FAEnabled();
        const authMethod = await settingsService.get2FAMethod();
        
        setIsEnabled(enabled);
        setMethod(authMethod);
      } catch (error) {
        console.error('Error loading 2FA settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const enable2FA = useCallback(async (method: '2fa_app' | 'sms') => {
    try {
      const result = await settingsService.enable2FA(method);
      
      if (result.success) {
        setIsEnabled(true);
        setMethod(method);
      }
      
      return result;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return { success: false };
    }
  }, []);
  
  const disable2FA = useCallback(async () => {
    try {
      const success = await settingsService.disable2FA();
      
      if (success) {
        setIsEnabled(false);
        setMethod(null);
      }
      
      return success;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  }, []);
  
  const generateBackupCodes = useCallback(async () => {
    try {
      return await settingsService.generateBackupCodes();
    } catch (error) {
      console.error('Error generating backup codes:', error);
      return [];
    }
  }, []);
  
  return { 
    isEnabled, 
    method, 
    loading, 
    enable2FA, 
    disable2FA, 
    generateBackupCodes 
  };
}