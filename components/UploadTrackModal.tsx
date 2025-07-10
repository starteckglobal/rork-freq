import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView
} from 'react-native';
import { X, Upload, Image as ImageIcon, Music, Calendar, Tag, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { defaultCoverArt } from '@/constants/images';
import StyledInput from '@/components/StyledInput';
import StyledButton from '@/components/StyledButton';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserStore } from '@/store/user-store';
import { analytics } from '@/services/analytics';

interface UploadTrackModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (trackId: string) => void;
  initialPlaylistId?: string;
}

// Define a proper type for errors
interface FormErrors {
  title?: string;
  artist?: string;
  genre?: string;
  audioFile?: string;
  coverImage?: string;
  [key: string]: string | undefined;
}

export default function UploadTrackModal({ 
  visible, 
  onClose, 
  onSuccess,
  initialPlaylistId 
}: UploadTrackModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<any>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const { currentUser } = useUserStore();
  
  // Reset form when modal is opened/closed
  useEffect(() => {
    if (visible) {
      resetForm();
      if (currentUser) {
        setArtist(currentUser.displayName);
      }
    }
  }, [visible, currentUser]);
  
  const resetForm = () => {
    setTitle('');
    if (currentUser) {
      setArtist(currentUser.displayName);
    } else {
      setArtist('');
    }
    setGenre('');
    setReleaseDate(new Date());
    setCoverImage(null);
    setAudioFile(null);
    setIsPrivate(false);
    setErrors({});
    setFormTouched(false);
    setDuration(0);
  };
  
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (!result.canceled) {
        setCoverImage(result.assets[0].uri);
        // Fixed: Use proper type for errors
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.coverImage;
          return newErrors;
        });
        setFormTouched(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  
  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        setAudioFile(result.assets[0]);
        // Fixed: Use proper type for errors
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.audioFile;
          return newErrors;
        });
        setFormTouched(true);
        
        // In a real app, you would get the duration from the audio file
        // For now, we'll just set a random duration between 2 and 5 minutes
        const randomDuration = Math.floor(Math.random() * (300 - 120 + 1)) + 120;
        setDuration(randomDuration);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to select audio file');
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = 'Track title is required';
      isValid = false;
    }
    
    if (!artist.trim()) {
      newErrors.artist = 'Artist name is required';
      isValid = false;
    }
    
    if (!genre.trim()) {
      newErrors.genre = 'Genre is required';
      isValid = false;
    }
    
    if (!audioFile) {
      newErrors.audioFile = 'Audio file is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleUpload = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would upload the files to a server
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock track ID
      const trackId = `track-${Date.now()}`;
      
      // Track analytics event
      analytics.track('track_uploaded', {
        user_id: currentUser?.id || 'anonymous',
        track_title: title,
        genre: genre,
        is_private: isPrivate,
        has_cover_image: !!coverImage,
        added_to_playlist: !!initialPlaylistId,
      });
      
      setIsLoading(false);
      
      // Show success message
      Alert.alert(
        "Success",
        "Your track has been uploaded successfully!",
        [{ text: "OK", onPress: () => {
          resetForm();
          if (onSuccess) {
            onSuccess(trackId);
          }
          onClose();
        }}]
      );
    } catch (error) {
      console.error('Error uploading track:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to upload track. Please try again.');
    }
  };
  
  const confirmClose = () => {
    if (formTouched) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to close?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => {
            resetForm();
            onClose();
          }}
        ]
      );
    } else {
      onClose();
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReleaseDate(selectedDate);
      setFormTouched(true);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={confirmClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Upload Track</Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={confirmClose}
                  disabled={isLoading}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                  <TouchableOpacity 
                    style={styles.coverImageContainer}
                    onPress={handlePickImage}
                    disabled={isLoading}
                  >
                    <Image 
                      source={{ uri: coverImage || defaultCoverArt }}
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <View style={styles.coverImageOverlay}>
                      <ImageIcon size={24} color={colors.text} />
                      <Text style={styles.coverImageText}>
                        {coverImage ? 'Change Cover' : 'Add Cover'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.audioFileContainer, audioFile ? styles.audioFileSelected : null]}
                    onPress={handlePickAudio}
                    disabled={isLoading}
                  >
                    <Music size={24} color={colors.text} />
                    <Text style={styles.audioFileText}>
                      {audioFile ? audioFile.name : 'Select Audio File'}
                    </Text>
                    {audioFile && duration > 0 && (
                      <View style={styles.durationContainer}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {errors.audioFile && <Text style={styles.errorText}>{errors.audioFile}</Text>}
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <StyledInput
                      placeholder="Track title"
                      value={title}
                      onChangeText={(text) => {
                        setTitle(text);
                        setFormTouched(true);
                        if (text.trim()) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.title;
                            return newErrors;
                          });
                        }
                      }}
                      maxLength={100}
                      editable={!isLoading}
                      containerStyle={styles.styledInputContainer}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Artist</Text>
                    <StyledInput
                      placeholder="Artist name"
                      value={artist}
                      onChangeText={(text) => {
                        setArtist(text);
                        setFormTouched(true);
                        if (text.trim()) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.artist;
                            return newErrors;
                          });
                        }
                      }}
                      maxLength={100}
                      editable={!isLoading}
                      containerStyle={styles.styledInputContainer}
                    />
                    {errors.artist && <Text style={styles.errorText}>{errors.artist}</Text>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Genre</Text>
                    <StyledInput
                      placeholder="Genre"
                      value={genre}
                      onChangeText={(text) => {
                        setGenre(text);
                        setFormTouched(true);
                        if (text.trim()) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.genre;
                            return newErrors;
                          });
                        }
                      }}
                      maxLength={50}
                      editable={!isLoading}
                      containerStyle={styles.styledInputContainer}
                    />
                    {errors.genre && <Text style={styles.errorText}>{errors.genre}</Text>}
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Release Date</Text>
                    <TouchableOpacity 
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text style={styles.dateText}>
                        {releaseDate.toLocaleDateString()}
                      </Text>
                      <Calendar size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={releaseDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>
                  
                  <View style={styles.privacyContainer}>
                    <View style={styles.privacyLabelContainer}>
                      <Text style={styles.inputLabel}>Privacy</Text>
                      <Text style={styles.privacyDescription}>
                        {isPrivate 
                          ? "Only you can see this track" 
                          : "Anyone can find and listen to this track"}
                      </Text>
                    </View>
                    <Switch
                      value={isPrivate}
                      onValueChange={(value) => {
                        setIsPrivate(value);
                        setFormTouched(true);
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.text}
                      disabled={isLoading}
                    />
                  </View>
                  
                  <View style={styles.uploadButtonContainer}>
                    <StyledButton
                      title={isLoading ? "Uploading..." : "Upload Track"}
                      onPress={handleUpload}
                      disabled={isLoading || !formTouched}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  scrollView: {
    width: '100%',
  },
  form: {
    padding: 16,
  },
  coverImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  audioFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  audioFileSelected: {
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  audioFileText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
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
  genreContainer: {
    position: 'relative',
  },
  genreInput: {
    paddingRight: 40,
  },
  genreIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    color: colors.text,
    fontSize: 16,
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  privacyLabelContainer: {
    flex: 1,
  },
  privacyDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.cardElevated,
    opacity: 0.7,
  },
  styledInputContainer: {
    width: '100%',
    maxWidth: '100%',
  },
  uploadButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});