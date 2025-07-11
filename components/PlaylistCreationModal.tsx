import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { X, Upload, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { analyticsEventBus } from '@/services/analytics-event-bus';

const { width, height } = Dimensions.get('window');

export interface PlaylistCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (playlistId: string) => void;
}

export default function PlaylistCreationModal({ visible, onClose, onSuccess }: PlaylistCreationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { createPlaylist } = useUserStore();
  
  // Request camera permissions
  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };
  
  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };
  
  // Handle image selection from gallery
  const selectImageFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;
    
    try {
      setIsUploading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setCoverArt(result.assets[0].uri);
        
        // Track image selection
        analyticsEventBus.publish('custom_event', {
          category: 'playlist_creation',
          action: 'cover_art_selected',
          source: 'gallery',
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle image capture from camera
  const captureImageFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    
    try {
      setIsUploading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setCoverArt(result.assets[0].uri);
        
        // Track image capture
        analyticsEventBus.publish('custom_event', {
          category: 'playlist_creation',
          action: 'cover_art_selected',
          source: 'camera',
        });
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Show image selection options
  const showImageOptions = () => {
    Alert.alert(
      'Select Cover Art',
      'Choose how you want to add cover art for your playlist:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: captureImageFromCamera },
        { text: 'Photo Library', onPress: selectImageFromGallery },
      ]
    );
  };
  
  // Remove selected cover art
  const removeCoverArt = () => {
    setCoverArt(null);
    
    // Track cover art removal
    analyticsEventBus.publish('custom_event', {
      category: 'playlist_creation',
      action: 'cover_art_removed',
    });
  };
  
  const handleCreatePlaylist = async () => {
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Playlist name is required');
      
      // Track validation error
      analyticsEventBus.publish('custom_event', {
        category: 'form_validation',
        action: 'playlist_creation_error',
        error: 'empty_name',
      });
      
      return;
    }
    
    if (trimmedName.length < 2) {
      setNameError('Playlist name must be at least 2 characters');
      return;
    }
    
    if (trimmedName.length > 50) {
      setNameError('Playlist name must be less than 50 characters');
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Create playlist with cover art
      const playlistId = createPlaylist(trimmedName, description.trim(), isPrivate, coverArt);
      
      if (!playlistId) {
        setNameError('Failed to create playlist');
        return;
      }
      
      // Track playlist creation
      analyticsEventBus.publish('playlist_create', {
        playlist_id: playlistId,
        playlist_name: trimmedName,
        is_private: isPrivate,
        has_description: description.trim().length > 0,
        has_cover_art: !!coverArt,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIsPrivate(false);
      setCoverArt(null);
      setNameError('');
      
      // Close modal
      onClose();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(playlistId);
      }
      
      // Show success message
      Alert.alert('Success', `Playlist "${trimmedName}" created successfully!`);
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      
      // Track error
      analyticsEventBus.publish('custom_event', {
        category: 'error',
        action: 'playlist_creation_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      setNameError('Failed to create playlist. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form
    setName('');
    setDescription('');
    setIsPrivate(false);
    setCoverArt(null);
    setNameError('');
    
    // Track cancel
    analyticsEventBus.publish('custom_event', {
      category: 'ui_interaction',
      action: 'playlist_creation_cancel',
    });
    
    // Close modal
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Playlist</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.form} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            nestedScrollEnabled={Platform.OS === 'android'}
            removeClippedSubviews={Platform.OS === 'android'}
            scrollEnabled={true}
            persistentScrollbar={Platform.OS === 'android'}
          >
            {/* Cover Art Section */}
            <Text style={styles.label}>Cover Art (optional)</Text>
            <View style={styles.coverArtSection}>
              {coverArt ? (
                <View style={styles.coverArtContainer}>
                  <Image source={{ uri: coverArt }} style={styles.coverArtImage} />
                  <TouchableOpacity 
                    style={styles.removeCoverArtButton}
                    onPress={removeCoverArt}
                  >
                    <X size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={showImageOptions}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Text style={styles.uploadButtonText}>Uploading...</Text>
                  ) : (
                    <>
                      <Upload size={24} color={colors.textSecondary} />
                      <Text style={styles.uploadButtonText}>Add Cover Art</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Enter playlist name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) {
                  setNameError('');
                }
              }}
              autoFocus
              maxLength={50}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add an optional description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Private Playlist</Text>
              <Switch
                value={isPrivate}
                onValueChange={(value) => {
                  setIsPrivate(value);
                  
                  // Track privacy toggle
                  analyticsEventBus.publish('custom_event', {
                    category: 'ui_interaction',
                    action: 'playlist_privacy_toggle',
                    is_private: value,
                  });
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            
            <Text style={styles.privacyHint}>
              {isPrivate 
                ? "Private playlists are only visible to you" 
                : "Public playlists can be seen by anyone"}
            </Text>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isCreating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.createButton, 
                (!name.trim() || isCreating || isUploading) ? styles.disabledButton : null
              ]}
              onPress={handleCreatePlaylist}
              disabled={!name.trim() || isCreating || isUploading}
            >
              <Text style={styles.createButtonText}>
                {isCreating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: Math.min(width * 0.9, 500),
    maxHeight: height * 0.8,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  form: {
    padding: 16,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  coverArtSection: {
    marginBottom: 16,
  },
  coverArtContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  coverArtImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  removeCoverArtButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  uploadButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    marginTop: -12,
    marginBottom: 16,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  privacyHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.cardElevated,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});