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
  Dimensions
} from 'react-native';
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { freqLogo } from '@/constants/images';
import { analytics } from '@/services/analytics';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useRouter } from 'expo-router';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
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
      setError('Please fill in all fields');
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
    
    // Use the register function from the store
    register({
      username,
      email,
      displayName
    }, password)
      .then(success => {
        if (success) {
          // Track registration in analytics
          analyticsEventBus.publish('custom_event', {
            category: 'user',
            action: 'registration',
            username,
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
    }
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
        <View style={[styles.modalContent, { width: width > 500 ? 400 : width * 0.9 }]}>
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
              source={freqLogo}
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
                <View style={styles.inputContainer}>
                  <User size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                    placeholderTextColor={colors.textTertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <User size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={colors.textTertiary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}
            
            <View style={styles.inputContainer}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            
            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={mode === 'login' ? handleLogin : handleRegister}
            >
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            
            {mode === 'login' && (
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleDemoLogin}
              >
                <Text style={styles.demoButtonText}>
                  Use Demo Account
                </Text>
              </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
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
});