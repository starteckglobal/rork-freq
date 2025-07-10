// Dark theme colors
export const darkColors = {
  // Primary colors
  primary: '#2B4BF2', // Royal blue
  primaryDark: '#1A3AD8',
  primaryLight: '#5A73F5',
  
  // Background colors
  background: '#121212',
  card: '#1E1E1E',
  cardElevated: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#737373',
  
  // UI elements
  border: '#2A2A2A',
  divider: '#2A2A2A',
  icon: '#B3B3B3',
  iconActive: '#2B4BF2',
  
  // Status colors
  success: '#34C759',
  warning: '#FFCC00',
  error: '#FF3B30',
  
  // Additional colors for notifications
  secondary: '#8A3FFC', // Purple
  accent: '#FF6B35', // Orange
  
  // Gradients
  gradientStart: '#2B4BF2',
  gradientEnd: '#8A3FFC', // Purple to match the logo background
};

// Light theme colors
export const lightColors = {
  // Primary colors
  primary: '#2B4BF2', // Royal blue
  primaryDark: '#1A3AD8',
  primaryLight: '#5A73F5',
  
  // Background colors
  background: '#FFFFFF',
  card: '#F8F9FA',
  cardElevated: '#FFFFFF',
  
  // Text colors
  text: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#8E8E93',
  
  // UI elements
  border: '#E5E5EA',
  divider: '#E5E5EA',
  icon: '#6C6C70',
  iconActive: '#2B4BF2',
  
  // Status colors
  success: '#34C759',
  warning: '#FFCC00',
  error: '#FF3B30',
  
  // Additional colors for notifications
  secondary: '#8A3FFC', // Purple
  accent: '#FF6B35', // Orange
  
  // Gradients
  gradientStart: '#2B4BF2',
  gradientEnd: '#8A3FFC', // Purple to match the logo background
};

// Default to dark theme for backward compatibility
export const colors = darkColors;

export default colors;

export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;