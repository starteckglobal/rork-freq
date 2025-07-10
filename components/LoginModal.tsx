import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Image,
  Alert,
  Dimensions,
  ScrollView
} from 'react-native';
import { X, Eye, EyeOff, Mail, Lock, User, Camera, Upload } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { freqLogoUrl } from '@/constants/images';
import { analytics } from '@/services/analytics';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import StyledInput from '@/components/StyledInput';
import StyledButton from '@/components/StyledButton';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function LoginModal({ visible, onClose }: LoginModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { login, register, updateProfile } = useUserStore();
  
  // Handle back button on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (visible) {
            onClose();
            return true;
          }
          return false;
        }
      );
      
      return () => backHandler.remove();
    }
  }, [visible, onClose]);
  
  // Set demo credentials for easy testing
  useEffect(() => {
    if (visible && mode === 'login') {
      setEmail('demo');
      setPassword('password');
    }
  }, [visible, mode]);
  
  const handleLogin = () => {
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Use the login function from the store
    login(email, password)
      .then(success => {
        if (success) {
          // Track login in analytics
          analytics.track('user_login', {
            login_method: 'email',
          });
          
          // Navigate to SyncLab after successful login
          setTimeout(() => {
            router.push('/synclab');
          }, 500);
          
          onClose();
        } else {
          setError('Invalid credentials. Please try again.');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        setError('An error occurred during login. Please try again.');
      });
  };
  
  const handleRegister = () => {
    setError('');
    
    if (!email || !password || !username || !displayName) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!email.includes('@') && email !== 'demo') {
      setError('Please enter a valid email');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    // Use the register function from the store
    register({
      username,
      email,
      displayName,
      bio,
      avatarUrl: profileImage || undefined
    }, password)
      .then(success => {
        if (success) {
          // Track registration in analytics
          analyticsEventBus.publish('custom_event', {
            category: 'user',
            action: 'registration',
            username,
            has_profile_image: !!profileImage,
            has_bio: !!bio,
          });
          
          // Navigate to SyncLab after successful registration
          setTimeout(() => {
            router.push('/synclab');
          }, 500);
          
          onClose();
        } else {
          setError('Registration failed. Please try again.');
        }
      })
      .catch(err => {
        console.error('Registration error:', err);
        setError('An error occurred during registration. Please try again.');
      });
  };
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    
    // Clear fields when switching modes
    if (mode === 'login') {
      setEmail('');
      setPassword('');
    } else {
      setUsername('');
      setDisplayName('');
      setBio('');
      setProfileImage(null);
    }
  };
  
  const pickImage = async () => {
    try {
      setIsUploading(true);
      
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const takePhoto = async () => {
    try {
      setIsUploading(true);
      
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const showImagePicker = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add your profile picture',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  const handleDemoLogin = () => {
    setEmail('demo');
    setPassword('password');
    handleLogin();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.modalContent, { 
            width: Platform.select({
              web: Math.min(450, width * 0.9),
              default: width > 500 ? 400 : width * 0.9
            })
          }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: freqLogoUrl }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? "Sign in to access your music, playlists, and more"
                : "Join FREQ to discover and share amazing music"}
            </Text>
          )}
          
          <View style={styles.form}>
            {mode === 'register' && (
              <>
                {/* Profile Picture Section */}
                <View style={styles.profilePictureSection}>
                  <Text style={styles.sectionLabel}>Profile Picture</Text>
                  <View style={styles.profilePictureContainer}>
                    <TouchableOpacity 
                      style={styles.profilePictureButton}
                      onPress={showImagePicker}
                      disabled={isUploading}
                    >
                      {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profilePicture} />
                      ) : (
                        <View style={styles.profilePicturePlaceholder}>
                          <Camera size={32} color={colors.textSecondary} />
                        </View>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={showImagePicker}
                      disabled={isUploading}
                    >
                      <Upload size={16} color={colors.primary} />
                      <Text style={styles.uploadButtonText}>
                        {isUploading ? 'Uploading...' : profileImage ? 'Change Photo' : 'Add Photo'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.styledInputContainer}>
                  <StyledInput
                    placeholder="Display Name *"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.styledInputContainer}>
                  <StyledInput
                    placeholder="Username *"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.styledInputContainer}>
                  <StyledInput
                    placeholder="Email *"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.bioContainer]}>
                  <User size={20} color={colors.textSecondary} style={styles.bioIcon} />
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Bio (optional)"
                    placeholderTextColor={colors.textTertiary}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
            
            {mode === 'login' && (
              <View style={styles.styledInputContainer}>
                <StyledInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"

                />
              </View>
            )}
            
            <View style={styles.styledInputContainer}>
              <StyledInput
                placeholder={mode === 'register' ? 'Password *' : 'Password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            
            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.styledButtonContainer}>
              <StyledButton
                title={mode === 'login' ? 'Login' : 'Sign Up'}
                onPress={mode === 'login' ? handleLogin : handleRegister}
              />
            </View>
            
            {mode === 'login' && (
              <View style={styles.styledButtonContainer}>
                <StyledButton
                  title="Use Demo Account"
                  onPress={handleDemoLogin}
                  variant="secondary"
                />
              </View>
            )}
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>
                Continue with Google
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.footerLink}>
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: '100%',
    ...Platform.select({
      web: {
        maxHeight: '90vh',
        overflowY: 'auto' as any,
      },
      default: {
        maxHeight: '90%',
      },
    }),
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 60,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    marginHorizontal: 16,
  },
  socialButton: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  socialButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profilePictureButton: {
    marginBottom: 12,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
  },
  profilePicturePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uploadButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  bioContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  bioIcon: {
    marginTop: 4,
  },
  bioInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  styledInputContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  styledButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
});