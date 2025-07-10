import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ViewStyle, TextStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function StyledButton({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false,
  variant = 'primary'
}: StyledButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, styles.container, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <LinearGradient
          colors={variant === 'primary' ? ['#e81cff', '#40c9ff'] : ['#fc00ff', '#00dbde']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBorder, isPressed && styles.gradientBorderPressed]}
        >
          <LinearGradient
            colors={isPressed 
              ? ['#8B5CF6', '#06B6D4'] 
              : variant === 'primary' 
                ? ['#fc00ff', '#00dbde'] 
                : ['#e81cff', '#40c9ff']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <TouchableOpacity
              style={[
                styles.button, 
                disabled && styles.buttonDisabled,
                isPressed && styles.buttonPressed
              ]}
              onPress={onPress}
              disabled={disabled}
              activeOpacity={1}
            >
              <Text style={[styles.buttonText, textStyle, disabled && styles.buttonTextDisabled]}>
                {title}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gradientBorder: {
    borderRadius: 10,
    padding: 1.5,
    shadowColor: '#fc00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBorderPressed: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientBackground: {
    borderRadius: 8,
    shadowColor: '#00dbde',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});