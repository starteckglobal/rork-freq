import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated, Platform } from 'react-native';
import { colors } from '@/constants/colors';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
}

export default function StyledButton({ title, onPress, style }: StyledButtonProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous rotation animation for the background effect
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => rotateAnimation.stop();
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(hoverAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(hoverAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const backgroundColor = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(193, 228, 248, 0.8)'],
  });

  const textColor = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, '#210055'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[styles.container, style]}
    >
      <Animated.View style={[
        styles.button,
        {
          backgroundColor,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        {/* Animated background effect */}
        <View style={styles.hoverEffect}>
          <Animated.View
            style={[
              styles.gradientCircle,
              {
                transform: [{ rotate }]
              }
            ]}
          />
        </View>
        
        <Animated.Text style={[
          styles.buttonText,
          { color: textColor }
        ]}>
          {title}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 160,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 0px 7px -5px rgba(0, 0, 0, 0.5)',
      }
    }),
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 120,
  },
  hoverEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  gradientCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DE004B',
    opacity: 0.3,
    ...Platform.select({
      web: {
        background: 'linear-gradient(90deg, rgba(222, 0, 75, 1) 0%, rgba(191, 70, 255, 1) 49%, rgba(0, 212, 255, 1) 100%)',
        filter: 'blur(20px)',
      },
      default: {
        // For mobile, we'll use a solid color with opacity since gradients are complex
        backgroundColor: '#BF46FF',
      }
    }),
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    zIndex: 2,
    position: 'relative',
  },
});