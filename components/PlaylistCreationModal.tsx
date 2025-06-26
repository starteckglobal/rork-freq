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
  ScrollView
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { analyticsEventBus } from '@/services/analytics-event-bus';

export interface PlaylistCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (playlistId: string) => void;
}

export default function PlaylistCreationModal({ visible, onClose, onSuccess }: PlaylistCreationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [nameError, setNameError] = useState('');
  
  const { createPlaylist } = useUserStore();
  
  const handleCreatePlaylist = () => {
    // Validate name
    if (!name.trim()) {
      setNameError('Playlist name is required');
      
      // Track validation error
      analyticsEventBus.publish('custom_event', {
        category: 'form_validation',
        action: 'playlist_creation_error',
        error: 'empty_name',
      });
      
      return;
    }
    
    try {
      // Create playlist
      const playlistId = createPlaylist({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        tracks: []
      });
      
      // Track playlist creation
      analyticsEventBus.publish('playlist_create', {
        playlist_id: playlistId,
        playlist_name: name.trim(),
        is_private: isPrivate,
        has_description: description.trim().length > 0,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIsPrivate(false);
      setNameError('');
      
      // Close modal
      onClose();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(playlistId);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      
      // Track error
      analyticsEventBus.publish('custom_event', {
        category: 'error',
        action: 'playlist_creation_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
  
  const handleCancel = () => {
    // Reset form
    setName('');
    setDescription('');
    setIsPrivate(false);
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
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Playlist</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Playlist name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) {
                  setNameError('');
                }
              }}
              autoFocus
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
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.createButton, !name.trim() ? styles.disabledButton : null]}
              onPress={handleCreatePlaylist}
              disabled={!name.trim()}
            >
              <Text style={styles.createButtonText}>Create</Text>
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
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
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
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: -12,
    marginBottom: 16,
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
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
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