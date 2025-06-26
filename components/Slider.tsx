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
          step="0.01"
          value={value.toString()}
          onChange={(e) => onValueChange && onValueChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: 40,
            accentColor: minimumTrackTintColor,
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <RNSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        style={styles.slider}
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