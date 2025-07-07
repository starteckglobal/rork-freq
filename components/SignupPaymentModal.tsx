import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { X, CreditCard, Lock, User, Mail, Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useUserStore } from '@/store/user-store';

interface SignupPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  selectedPlan: {
    id: string;
    name: string;
    price: string;
    period: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function SignupPaymentModal({ visible, onClose, selectedPlan }: SignupPaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<'account' | 'payment'>('account');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, subscribeToPlan } = useUserStore();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const createPaymentIntentMutation = trpc.payment.createPaymentIntent.useMutation();
  const confirmPaymentMutation = trpc.payment.confirmPayment.useMutation();

  const validateAccountForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Card number is invalid';
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Format: MM/YY';
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
    else if (formData.cvv.length < 3) newErrors.cvv = 'CVV is invalid';
    if (!formData.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContinueToPayment = () => {
    if (validateAccountForm()) {
      setCurrentStep('payment');
    }
  };

  const handleBackToAccount = () => {
    setCurrentStep('account');
  };

  const handleCompleteSignup = async () => {
    if (!validatePaymentForm()) return;

    setLoading(true);
    
    try {
      console.log('Starting payment process...');
      
      // Create payment intent
      const paymentIntentResult = await createPaymentIntentMutation.mutateAsync({
        planId: selectedPlan.id,
        amount: selectedPlan.id === 'monthly' ? 999 : selectedPlan.id === 'yearly' ? 10000 : 50000,
        currency: 'usd',
        customerInfo: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        }
      });

      console.log('Payment intent result:', paymentIntentResult);

      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.error || 'Failed to create payment intent');
      }

      // Simulate payment processing (in real app, you'd use Stripe Elements)
      const paymentResult = await confirmPaymentMutation.mutateAsync({
        paymentIntentId: paymentIntentResult.paymentIntentId,
        paymentMethodData: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryMonth: formData.expiryDate.split('/')[0],
          expiryYear: formData.expiryDate.split('/')[1],
          cvv: formData.cvv,
          cardholderName: formData.cardholderName
        }
      });

      console.log('Payment result:', paymentResult);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Register user - only pass properties that exist in User interface
      const registrationSuccess = await register({
        email: formData.email,
        username: formData.username,
        displayName: `${formData.firstName} ${formData.lastName}`
      }, formData.password);

      if (!registrationSuccess) {
        throw new Error('Failed to create account');
      }

      // Subscribe to plan
      subscribeToPlan(selectedPlan.id);

      Alert.alert(
        'Welcome to SyncLab!',
        `Your ${selectedPlan.name} subscription is now active. Enjoy all the premium features!`,
        [{ text: 'Get Started', onPress: onClose }]
      );

    } catch (error) {
      console.error('Signup/Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderAccountStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <User size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Create Your Account</Text>
        <Text style={styles.stepSubtitle}>Join SyncLab and start creating amazing music</Text>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder="John"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder="Doe"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="john@example.com"
          placeholderTextColor={colors.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
          placeholder="johndoe"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, errors.password && styles.inputError]}
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Enter password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Confirm password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinueToPayment}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPaymentStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <CreditCard size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Payment Information</Text>
        <Text style={styles.stepSubtitle}>
          Complete your {selectedPlan.name} subscription for {selectedPlan.price} {selectedPlan.period}
        </Text>
      </View>

      <View style={styles.planSummary}>
        <Text style={styles.planSummaryTitle}>Order Summary</Text>
        <View style={styles.planSummaryRow}>
          <Text style={styles.planSummaryLabel}>{selectedPlan.name}</Text>
          <Text style={styles.planSummaryValue}>{selectedPlan.price}</Text>
        </View>
        <View style={styles.planSummaryDivider} />
        <View style={styles.planSummaryRow}>
          <Text style={styles.planSummaryTotalLabel}>Total</Text>
          <Text style={styles.planSummaryTotalValue}>{selectedPlan.price}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Cardholder Name</Text>
        <TextInput
          style={[styles.input, errors.cardholderName && styles.inputError]}
          value={formData.cardholderName}
          onChangeText={(value) => handleInputChange('cardholderName', value)}
          placeholder="John Doe"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
        {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput
          style={[styles.input, errors.cardNumber && styles.inputError]}
          value={formData.cardNumber}
          onChangeText={(value) => handleInputChange('cardNumber', value)}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          maxLength={19}
        />
        {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
      </View>

      <View style={styles.formRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Expiry Date</Text>
          <TextInput
            style={[styles.input, errors.expiryDate && styles.inputError]}
            value={formData.expiryDate}
            onChangeText={(value) => handleInputChange('expiryDate', value)}
            placeholder="MM/YY"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
        </View>

        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={[styles.input, errors.cvv && styles.inputError]}
            value={formData.cvv}
            onChangeText={(value) => handleInputChange('cvv', value)}
            placeholder="123"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            maxLength={4}
          />
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>

      <View style={styles.securityNote}>
        <Lock size={16} color={colors.textSecondary} />
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToAccount}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.completeButton, loading && styles.disabledButton]}
          onPress={handleCompleteSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.completeButtonText}>Complete Signup</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Join SyncLab</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: currentStep === 'account' ? '50%' : '100%' }
            ]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep === 'account' ? '1' : '2'} of 2
          </Text>
        </View>

        {currentStep === 'account' ? renderAccountStep() : renderPaymentStep()}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.cardElevated,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  planSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  planSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  planSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planSummaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  planSummaryValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  planSummaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  planSummaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  planSummaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completeButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  disabledButton: {
    opacity: 0.7,
  },
});