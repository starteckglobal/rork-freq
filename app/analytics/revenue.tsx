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
import { ChevronLeft, DollarSign, TrendingUp, Calendar, Download } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function RevenueReportsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Revenue Reports',
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
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Revenue Overview</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$1,234.56</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$234.78</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$89.12</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$1,145.44</Text>
              <Text style={styles.statLabel}>Paid Out</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Sources</Text>
          
          <View style={styles.revenueSource}>
            <View style={styles.sourceHeader}>
              <Text style={styles.sourceName}>Streaming Royalties</Text>
              <Text style={styles.sourceAmount}>$856.34</Text>
            </View>
            <View style={styles.sourceBar}>
              <View style={[styles.sourceProgress, { width: '70%' }]} />
            </View>
            <Text style={styles.sourceDescription}>From Spotify, Apple Music, etc.</Text>
          </View>

          <View style={styles.revenueSource}>
            <View style={styles.sourceHeader}>
              <Text style={styles.sourceName}>Sync Licensing</Text>
              <Text style={styles.sourceAmount}>$278.22</Text>
            </View>
            <View style={styles.sourceBar}>
              <View style={[styles.sourceProgress, { width: '22%' }]} />
            </View>
            <Text style={styles.sourceDescription}>TV, film, and commercial placements</Text>
          </View>

          <View style={styles.revenueSource}>
            <View style={styles.sourceHeader}>
              <Text style={styles.sourceName}>Direct Sales</Text>
              <Text style={styles.sourceAmount}>$100.00</Text>
            </View>
            <View style={styles.sourceBar}>
              <View style={[styles.sourceProgress, { width: '8%' }]} />
            </View>
            <Text style={styles.sourceDescription}>Direct track purchases</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
          
          <View style={styles.monthlyList}>
            <View style={styles.monthlyItem}>
              <View style={styles.monthlyLeft}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.monthlyMonth}>January 2024</Text>
              </View>
              <View style={styles.monthlyRight}>
                <Text style={styles.monthlyAmount}>$234.78</Text>
                <TrendingUp size={16} color="#4CAF50" />
              </View>
            </View>

            <View style={styles.monthlyItem}>
              <View style={styles.monthlyLeft}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.monthlyMonth}>December 2023</Text>
              </View>
              <View style={styles.monthlyRight}>
                <Text style={styles.monthlyAmount}>$189.45</Text>
                <TrendingUp size={16} color="#4CAF50" />
              </View>
            </View>

            <View style={styles.monthlyItem}>
              <View style={styles.monthlyLeft}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.monthlyMonth}>November 2023</Text>
              </View>
              <View style={styles.monthlyRight}>
                <Text style={styles.monthlyAmount}>$156.23</Text>
                <TrendingUp size={16} color="#4CAF50" />
              </View>
            </View>

            <View style={styles.monthlyItem}>
              <View style={styles.monthlyLeft}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.monthlyMonth}>October 2023</Text>
              </View>
              <View style={styles.monthlyRight}>
                <Text style={styles.monthlyAmount}>$143.67</Text>
                <TrendingUp size={16} color="#FF9800" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Tracks</Text>
          
          <View style={styles.tracksList}>
            <View style={styles.trackItem}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>Midnight Dreams</Text>
                <Text style={styles.trackPlays}>12,456 plays</Text>
              </View>
              <Text style={styles.trackEarnings}>$89.34</Text>
            </View>

            <View style={styles.trackItem}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>Electric Nights</Text>
                <Text style={styles.trackPlays}>8,923 plays</Text>
              </View>
              <Text style={styles.trackEarnings}>$67.12</Text>
            </View>

            <View style={styles.trackItem}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>Summer Vibes</Text>
                <Text style={styles.trackPlays}>6,789 plays</Text>
              </View>
              <Text style={styles.trackEarnings}>$45.67</Text>
            </View>

            <View style={styles.trackItem}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>City Lights</Text>
                <Text style={styles.trackPlays}>5,234 plays</Text>
              </View>
              <Text style={styles.trackEarnings}>$32.65</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Payment Information</Text>
          <Text style={styles.infoText}>
            • Payments are processed monthly on the 15th
          </Text>
          <Text style={styles.infoText}>
            • Minimum payout threshold: $50.00
          </Text>
          <Text style={styles.infoText}>
            • Processing time: 3-5 business days
          </Text>
          <Text style={styles.infoText}>
            • Tax forms available in your account settings
          </Text>
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
  downloadButton: {
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  revenueSource: {
    marginBottom: 20,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sourceAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  sourceBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 4,
  },
  sourceProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sourceDescription: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  monthlyList: {
    gap: 12,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
  },
  monthlyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyMonth: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  monthlyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthlyAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tracksList: {
    gap: 12,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackPlays: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  trackEarnings: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
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
});