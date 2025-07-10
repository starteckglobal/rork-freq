import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface StyledInputProps extends TextInputProps {
  shortcut?: string;
  containerStyle?: any;
}

export default function StyledInput({ shortcut, containerStyle, style, ...props }: StyledInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['#3853c7', '#19ad88']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, style]}
            placeholderTextColor="#6b7280"
            {...props}
          />
          {shortcut && (
            <View style={styles.shortcut}>
              <Text style={styles.shortcutText}>{shortcut}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 280,
  },
  gradientBorder: {
    borderRadius: 12,
    padding: 2,
    ...Platform.select({
      web: {
        boxShadow: '20px 20px 60px rgba(56, 83, 199, 0.3), -20px -20px 60px rgba(25, 173, 136, 0.3)',
      },
      default: {
        shadowColor: '#3853c7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  inputWrapper: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  shortcut: {
    position: 'absolute',
    right: 8,
    backgroundColor: '#5e5757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutText: {
    color: '#c5c5c5',
    fontSize: 12,
    fontWeight: '500',
  },
});