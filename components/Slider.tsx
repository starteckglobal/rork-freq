import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import RNSlider from '@react-native-community/slider';

interface SliderProps {
  value: number;
  onValueChange?: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  thumbStyle?: any;
  vertical?: boolean;
  step?: number;
  style?: any;
}

export default function CustomSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  thumbStyle,
  vertical = false,
  step = 0.01,
  style,
}: SliderProps) {
  // For web, we need a fallback since the community slider might not work well
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <input
          type="range"
          min={minimumValue.toString()}
          max={maximumValue.toString()}
          step={step.toString()}
          value={value.toString()}
          onChange={(e) => onValueChange && onValueChange(parseFloat(e.target.value))}
          style={{
            width: vertical ? '40px' : '100%',
            height: vertical ? '100%' : '40px',
            accentColor: minimumTrackTintColor,
            transform: vertical ? 'rotate(-90deg)' : 'none',
            transformOrigin: 'center',
          }}
        />
      </View>
    );
  }

  // For vertical sliders on native, we need to rotate the slider
  const containerStyle = vertical ? {
    transform: [{ rotate: '-90deg' }],
    width: style?.height || 120,
    height: style?.width || 20,
  } : {};

  return (
    <View style={[styles.container, style, containerStyle]}>
      <RNSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor || thumbStyle?.backgroundColor}
        step={step}
        style={vertical ? { width: style?.height || 120, height: style?.width || 20 } : styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});