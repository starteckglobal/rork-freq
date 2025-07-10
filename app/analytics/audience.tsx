import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Users, TrendingUp, Globe, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function AudienceInsightsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Audience Insights',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Audience Overview</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1,234</Text>
              <Text style={styles.statLabel}>Total Listeners</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>567</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>89</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>45%</Text>
              <Text style={styles.statLabel}>Returning</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demographics</Text>
          
          <View style={styles.demographicItem}>
            <Text style={styles.demographicLabel}>Age Groups</Text>
            <View style={styles.demographicBar}>
              <View style={[styles.demographicSegment, { flex: 0.3, backgroundColor: colors.primary }]} />
              <View style={[styles.demographicSegment, { flex: 0.4, backgroundColor: colors.secondary }]} />
              <View style={[styles.demographicSegment, { flex: 0.2, backgroundColor: colors.accent }]} />
              <View style={[styles.demographicSegment, { flex: 0.1, backgroundColor: colors.border }]} />
            </View>
            <View style={styles.demographicLegend}>
              <Text style={styles.legendItem}>18-24 (30%)</Text>
              <Text style={styles.legendItem}>25-34 (40%)</Text>
              <Text style={styles.legendItem}>35-44 (20%)</Text>
              <Text style={styles.legendItem}>45+ (10%)</Text>
            </View>
          </View>

          <View style={styles.demographicItem}>
            <Text style={styles.demographicLabel}>Top Locations</Text>
            <View style={styles.locationList}>
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>United States</Text>
                <Text style={styles.locationPercentage}>35%</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>United Kingdom</Text>
                <Text style={styles.locationPercentage}>18%</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>Canada</Text>
                <Text style={styles.locationPercentage}>12%</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>Australia</Text>
                <Text style={styles.locationPercentage}>8%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listening Patterns</Text>
          
          <View style={styles.patternItem}>
            <Clock size={20} color={colors.primary} />
            <View style={styles.patternText}>
              <Text style={styles.patternTitle}>Peak Hours</Text>
              <Text style={styles.patternDescription}>Most active: 7-9 PM</Text>
            </View>
          </View>

          <View style={styles.patternItem}>
            <TrendingUp size={20} color={colors.primary} />
            <View style={styles.patternText}>
              <Text style={styles.patternTitle}>Growth Rate</Text>
              <Text style={styles.patternDescription}>+15% this month</Text>
            </View>
          </View>

          <View style={styles.patternItem}>
            <Globe size={20} color={colors.primary} />
            <View style={styles.patternText}>
              <Text style={styles.patternTitle}>Platform Mix</Text>
              <Text style={styles.patternDescription}>Mobile: 70%, Web: 30%</Text>
            </View>
          </View>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.cardElevated,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  demographicItem: {
    marginBottom: 24,
  },
  demographicLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  demographicBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  demographicSegment: {
    height: '100%',
  },
  demographicLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  locationList: {
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.cardElevated,
    borderRadius: 6,
  },
  locationName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  locationPercentage: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  patternText: {
    marginLeft: 12,
  },
  patternTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  patternDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});