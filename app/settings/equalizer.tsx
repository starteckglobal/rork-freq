import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Volume2, RotateCcw, Save } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Slider from '@/components/Slider';
import StyledButton from '@/components/StyledButton';

const FREQUENCY_BANDS = [
  { label: '60Hz', frequency: 60 },
  { label: '170Hz', frequency: 170 },
  { label: '310Hz', frequency: 310 },
  { label: '600Hz', frequency: 600 },
  { label: '1kHz', frequency: 1000 },
  { label: '3kHz', frequency: 3000 },
  { label: '6kHz', frequency: 6000 },
  { label: '12kHz', frequency: 12000 },
  { label: '14kHz', frequency: 14000 },
  { label: '16kHz', frequency: 16000 },
];

const PRESETS = {
  flat: { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: 'Rock', values: [4, 3, -1, -2, 1, 2, 3, 4, 4, 4] },
  pop: { name: 'Pop', values: [-1, 2, 4, 4, 1, -1, -1, -1, 2, 3] },
  jazz: { name: 'Jazz', values: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  classical: { name: 'Classical', values: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4] },
  electronic: { name: 'Electronic', values: [3, 2, 0, -1, 1, 3, 2, 1, 3, 4] },
  hiphop: { name: 'Hip-Hop', values: [4, 3, 1, 2, -1, 0, 1, 2, 3, 3] },
  vocal: { name: 'Vocal', values: [-2, -1, 1, 3, 3, 2, 1, 0, -1, -2] },
};

export default function EqualizerScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('flat');
  const [bandValues, setBandValues] = useState(PRESETS.flat.values);

  const handleBandChange = (index: number, value: number) => {
    const newValues = [...bandValues];
    newValues[index] = value;
    setBandValues(newValues);
    setSelectedPreset('custom');
  };

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setBandValues(PRESETS[presetKey as keyof typeof PRESETS].values);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Equalizer',
      'Are you sure you want to reset all bands to flat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setBandValues(PRESETS.flat.values);
            setSelectedPreset('flat');
          },
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Your equalizer settings have been saved',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Equalizer',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <RotateCcw size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Enable/Disable Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLeft}>
              <Volume2 size={24} color={colors.primary} />
              <Text style={styles.toggleTitle}>Equalizer</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isEnabled && styles.toggleEnabled]}
              onPress={() => setIsEnabled(!isEnabled)}
            >
              <View style={[styles.toggleThumb, isEnabled && styles.toggleThumbEnabled]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.toggleDescription}>
            Enhance your audio experience with custom frequency adjustments
          </Text>
        </View>

        {isEnabled && (
          <>
            {/* Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Presets</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsContainer}>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.presetButton,
                      selectedPreset === key && styles.presetButtonSelected
                    ]}
                    onPress={() => handlePresetSelect(key)}
                  >
                    <Text style={[
                      styles.presetButtonText,
                      selectedPreset === key && styles.presetButtonTextSelected
                    ]}>
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.presetButton,
                    selectedPreset === 'custom' && styles.presetButtonSelected
                  ]}
                >
                  <Text style={[
                    styles.presetButtonText,
                    selectedPreset === 'custom' && styles.presetButtonTextSelected
                  ]}>
                    Custom
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Frequency Bands */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequency Bands</Text>
              <View style={styles.equalizerContainer}>
                <View style={styles.bandsContainer}>
                  {FREQUENCY_BANDS.map((band, index) => (
                    <View key={band.frequency} style={styles.bandContainer}>
                      <View style={styles.sliderContainer}>
                        <Text style={styles.gainValue}>
                          {bandValues[index] > 0 ? '+' : ''}{bandValues[index]}dB
                        </Text>
                        <View style={styles.sliderWrapper}>
                          <Slider
                            value={bandValues[index]}
                            onValueChange={(value) => handleBandChange(index, Math.round(value))}
                            minimumValue={-12}
                            maximumValue={12}
                            step={1}
                            vertical={true}
                            style={styles.slider}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbStyle={styles.sliderThumb}
                          />
                        </View>
                        <Text style={styles.frequencyLabel}>{band.label}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>How to Use</Text>
              <Text style={styles.infoText}>
                • Drag sliders up to boost frequencies (+dB)
              </Text>
              <Text style={styles.infoText}>
                • Drag sliders down to reduce frequencies (-dB)
              </Text>
              <Text style={styles.infoText}>
                • Use presets for quick adjustments
              </Text>
              <Text style={styles.infoText}>
                • Lower frequencies (left) control bass
              </Text>
              <Text style={styles.infoText}>
                • Higher frequencies (right) control treble
              </Text>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <StyledButton
                title="Save Settings"
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  resetButton: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.text,
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  toggleDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  presetsContainer: {
    flexDirection: 'row',
  },
  presetButton: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  presetButtonSelected: {
    backgroundColor: colors.primary,
  },
  presetButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  presetButtonTextSelected: {
    color: '#FFF',
  },
  equalizerContainer: {
    alignItems: 'center',
  },
  bandsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  bandContainer: {
    flex: 1,
    alignItems: 'center',
  },
  sliderContainer: {
    alignItems: 'center',
    height: 200,
  },
  gainValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    minHeight: 16,
  },
  sliderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    height: 120,
    width: 20,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
  },
  frequencyLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 8,
    transform: [{ rotate: '-45deg' }],
  },
  infoSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    padding: 16,
  },
  saveButton: {
    marginBottom: 16,
  },
});