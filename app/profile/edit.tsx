import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Camera,
  Save,
  User,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Music
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { defaultAvatarUri } from '@/constants/images';

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile } = useUserStore();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [website, setWebsite] = useState(currentUser?.socialLinks?.website || '');
  const [instagram, setInstagram] = useState(currentUser?.socialLinks?.instagram || '');
  const [twitter, setTwitter] = useState(currentUser?.socialLinks?.twitter || '');
  const [facebook, setFacebook] = useState(currentUser?.socialLinks?.facebook || '');
  const [soundcloud, setSoundcloud] = useState(currentUser?.socialLinks?.soundcloud || '');
  const [isSaving, setIsSaving] = useState(false);
  
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{
          title: 'Edit Profile',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInText}>You need to be logged in to edit your profile</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access your photos");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };
  
  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access your camera");
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };
  
  const showImageOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose how you want to update your profile picture:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Photo Library', onPress: handlePickImage },
      ]
    );
  };
  
  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }
    
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updates = {
        displayName: displayName.trim(),
        username: username.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl || undefined,
        socialLinks: {
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          facebook: facebook.trim() || undefined,
          soundcloud: soundcloud.trim() || undefined,
        }
      };
      
      updateProfile(updates);
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        title: 'Edit Profile',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.saveButton}
            disabled={isSaving}
          >
            <Save size={20} color={isSaving ? colors.textSecondary : "#FFFFFF"} />
            <Text style={[styles.saveButtonText, { color: isSaving ? colors.textSecondary : "#FFFFFF" }]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={showImageOptions} style={styles.avatarContainer}>
            <Image 
              source={{ uri: avatarUrl || defaultAvatarUri }}
              style={styles.avatar}
            />
            <View style={styles.cameraOverlay}>
              <Camera size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change profile picture</Text>
        </View>
        
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Your email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <Globe size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Website</Text>
            </View>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://yourwebsite.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <Instagram size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Instagram</Text>
            </View>
            <TextInput
              style={styles.input}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="@yourusername"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <Twitter size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Twitter</Text>
            </View>
            <TextInput
              style={styles.input}
              value={twitter}
              onChangeText={setTwitter}
              placeholder="@yourusername"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <Facebook size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Facebook</Text>
            </View>
            <TextInput
              style={styles.input}
              value={facebook}
              onChangeText={setFacebook}
              placeholder="Your Facebook username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <Music size={16} color={colors.textSecondary} />
              <Text style={styles.label}>SoundCloud</Text>
            </View>
            <TextInput
              style={styles.input}
              value={soundcloud}
              onChangeText={setSoundcloud}
              placeholder="Your SoundCloud username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButtonLarge, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Save size={20} color={colors.text} />
          <Text style={styles.saveButtonLargeText}>
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
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
    padding: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    padding: 8,
    gap: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardElevated,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarHint: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButtonLarge: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonLargeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});