import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  BarChart, 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar, 
  Download, 
  Share2, 
  Heart, 
  Play, 
  Clock, 
  Filter, 
  ChevronDown
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { analytics } from '@/services/analytics';
import { LineChart, BarChart as RNBarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Mock data for charts
const playbackData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [25, 45, 28, 80, 99, 43, 50],
      color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // Royal blue
      strokeWidth: 2
    }
  ],
  legend: ["Plays"]
};

const audienceData = {
  labels: ["USA", "UK", "Germany", "France", "Canada", "Other"],
  data: [0.4, 0.2, 0.15, 0.1, 0.05, 0.1]
};

const engagementData = {
  labels: ["Likes", "Shares", "Comments", "Saves", "Downloads"],
  data: [
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100
  ]
};

const deviceData = {
  labels: ["iOS", "Android", "Web"],
  data: [0.6, 0.3, 0.1]
};

const timeData = {
  labels: ["12am", "4am", "8am", "12pm", "4pm", "8pm"],
  datasets: [
    {
      data: [20, 10, 30, 95, 85, 91],
      color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // Royal blue
      strokeWidth: 2
    }
  ],
  legend: ["Plays by Time"]
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const { isLoggedIn, currentUser } = useUserStore();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  
  // Track screen view
  useEffect(() => {
    analytics.track('screen_view', { 
      screen_name: 'Analytics',
      is_logged_in: isLoggedIn
    });
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn]);
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setShowTimeRangeDropdown(false);
    
    // Track analytics event
    analytics.track('analytics_time_range_changed', {
      previous_range: timeRange,
      new_range: range
    });
    
    // Simulate loading when changing time range
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };
  
  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary
    }
  };
  
  const pieChartConfig = {
    ...chartConfig,
    color: (opacity = 1, index = 0) => {
      const colors = [
        `rgba(65, 105, 225, ${opacity})`, // Royal blue
        `rgba(106, 90, 205, ${opacity})`, // Slate blue
        `rgba(138, 43, 226, ${opacity})`, // Blue violet
        `rgba(75, 0, 130, ${opacity})`,   // Indigo
        `rgba(147, 112, 219, ${opacity})`, // Medium purple
        `rgba(123, 104, 238, ${opacity})`, // Medium slate blue
      ];
      return colors[index % colors.length];
    }
  };
  
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Analytics',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInTitle}>Sign in to access analytics</Text>
          <Text style={styles.notLoggedInText}>
            You need to be logged in to view your analytics data
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => useUserStore.getState().setShowLoginModal(true)}
          >
            <Text style={styles.loginButtonText}>Login+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Analytics',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Analytics</Text>
        
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity 
            style={styles.timeRangeButton}
            onPress={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <Text style={styles.timeRangeText}>
              {timeRange === '7d' ? 'Last 7 days' : 
               timeRange === '30d' ? 'Last 30 days' : 
               timeRange === '90d' ? 'Last 90 days' : 'All time'}
            </Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
          
          {showTimeRangeDropdown && (
            <View style={styles.timeRangeDropdown}>
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('7d')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === '7d' && styles.timeRangeOptionTextActive
                ]}>Last 7 days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('30d')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === '30d' && styles.timeRangeOptionTextActive
                ]}>Last 30 days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('90d')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === '90d' && styles.timeRangeOptionTextActive
                ]}>Last 90 days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeRangeOption}
                onPress={() => handleTimeRangeChange('all')}
              >
                <Text style={[
                  styles.timeRangeOptionText,
                  timeRange === 'all' && styles.timeRangeOptionTextActive
                ]}>All time</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <BarChart size={16} color={activeTab === 'overview' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'audience' && styles.activeTab]}
            onPress={() => setActiveTab('audience')}
          >
            <Users size={16} color={activeTab === 'audience' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'audience' && styles.activeTabText]}>Audience</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'engagement' && styles.activeTab]}
            onPress={() => setActiveTab('engagement')}
          >
            <Heart size={16} color={activeTab === 'engagement' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'engagement' && styles.activeTabText]}>Engagement</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'geography' && styles.activeTab]}
            onPress={() => setActiveTab('geography')}
          >
            <Globe size={16} color={activeTab === 'geography' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'geography' && styles.activeTabText]}>Geography</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'time' && styles.activeTab]}
            onPress={() => setActiveTab('time')}
          >
            <Clock size={16} color={activeTab === 'time' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'time' && styles.activeTabText]}>Time</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading analytics data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {activeTab === 'overview' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Playback Overview</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>1,245</Text>
                  <Text style={styles.statLabel}>Total Plays</Text>
                  <View style={styles.statTrend}>
                    <TrendingUp size={12} color="#4CAF50" />
                    <Text style={styles.statTrendText}>+12%</Text>
                  </View>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>32:15</Text>
                  <Text style={styles.statLabel}>Avg. Listen Time</Text>
                  <View style={styles.statTrend}>
                    <TrendingUp size={12} color="#4CAF50" />
                    <Text style={styles.statTrendText}>+5%</Text>
                  </View>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>78%</Text>
                  <Text style={styles.statLabel}>Completion Rate</Text>
                  <View style={styles.statTrend}>
                    <TrendingUp size={12} color="#4CAF50" />
                    <Text style={styles.statTrendText}>+3%</Text>
                  </View>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>342</Text>
                  <Text style={styles.statLabel}>Unique Listeners</Text>
                  <View style={styles.statTrend}>
                    <TrendingUp size={12} color="#4CAF50" />
                    <Text style={styles.statTrendText}>+8%</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.chartTitle}>Plays Over Time</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.chart, { height: 220, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <LineChart
                  data={playbackData}
                  width={width - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={true}
                />
              )}
              
              <Text style={styles.sectionTitle}>Top Tracks</Text>
              <View style={styles.trackList}>
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>1</Text>
                  <Text style={styles.trackName}>Summer Vibes</Text>
                  <Text style={styles.trackPlays}>428 plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>2</Text>
                  <Text style={styles.trackName}>Midnight Dreams</Text>
                  <Text style={styles.trackPlays}>356 plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>3</Text>
                  <Text style={styles.trackName}>Ocean Waves</Text>
                  <Text style={styles.trackPlays}>289 plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>4</Text>
                  <Text style={styles.trackName}>City Lights</Text>
                  <Text style={styles.trackPlays}>172 plays</Text>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === 'audience' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Audience Demographics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>342</Text>
                  <Text style={styles.statLabel}>Unique Listeners</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>68%</Text>
                  <Text style={styles.statLabel}>Returning Listeners</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Avg. Age</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>3.2</Text>
                  <Text style={styles.statLabel}>Avg. Tracks/Session</Text>
                </View>
              </View>
              
              <Text style={styles.chartTitle}>Device Distribution</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.pieChartContainer, { height: 180, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={deviceData.data.map((value, index) => ({
                      name: deviceData.labels[index],
                      population: value * 100,
                      color: pieChartConfig.color(1, index),
                      legendFontColor: colors.text,
                      legendFontSize: 12,
                    }))}
                    width={width - 32}
                    height={180}
                    chartConfig={pieChartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              )}
              
              <Text style={styles.sectionTitle}>Listener Growth</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.chart, { height: 220, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <LineChart
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [
                      {
                        data: [20, 45, 28, 80, 99, 120],
                        color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
                        strokeWidth: 2
                      }
                    ],
                    legend: ["Monthly Listeners"]
                  }}
                  width={width - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={true}
                />
              )}
            </View>
          )}
          
          {activeTab === 'engagement' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Engagement Metrics</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>856</Text>
                  <Text style={styles.statLabel}>Total Likes</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>124</Text>
                  <Text style={styles.statLabel}>Shares</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>78</Text>
                  <Text style={styles.statLabel}>Comments</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>245</Text>
                  <Text style={styles.statLabel}>Playlist Adds</Text>
                </View>
              </View>
              
              <Text style={styles.chartTitle}>Engagement Breakdown</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.chart, { height: 220, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <RNBarChart
                  data={{
                    labels: engagementData.labels,
                    datasets: [
                      {
                        data: engagementData.data
                      }
                    ]
                  }}
                  width={width - 32}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  style={styles.chart}
                  withInnerLines={false}
                  withHorizontalLabels={false}
                  fromZero={true}
                />
              )}
              
              <Text style={styles.sectionTitle}>Top Engagement Sources</Text>
              <View style={styles.trackList}>
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>1</Text>
                  <Text style={styles.trackName}>Instagram</Text>
                  <Text style={styles.trackPlays}>42% of shares</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>2</Text>
                  <Text style={styles.trackName}>Twitter</Text>
                  <Text style={styles.trackPlays}>28% of shares</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>3</Text>
                  <Text style={styles.trackName}>Facebook</Text>
                  <Text style={styles.trackPlays}>18% of shares</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>4</Text>
                  <Text style={styles.trackName}>Direct Links</Text>
                  <Text style={styles.trackPlays}>12% of shares</Text>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === 'geography' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Geographic Distribution</Text>
              
              <Text style={styles.chartTitle}>Top Countries</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.pieChartContainer, { height: 220, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <PieChart
                  data={audienceData.data.map((value, index) => ({
                    name: audienceData.labels[index],
                    population: value * 100,
                    color: pieChartConfig.color(1, index),
                    legendFontColor: colors.text,
                    legendFontSize: 12,
                  }))}
                  width={width - 32}
                  height={220}
                  chartConfig={pieChartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
              
              <Text style={styles.sectionTitle}>Top Cities</Text>
              <View style={styles.trackList}>
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>1</Text>
                  <Text style={styles.trackName}>New York, USA</Text>
                  <Text style={styles.trackPlays}>15% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>2</Text>
                  <Text style={styles.trackName}>London, UK</Text>
                  <Text style={styles.trackPlays}>12% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>3</Text>
                  <Text style={styles.trackName}>Berlin, Germany</Text>
                  <Text style={styles.trackPlays}>8% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>4</Text>
                  <Text style={styles.trackName}>Paris, France</Text>
                  <Text style={styles.trackPlays}>6% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>5</Text>
                  <Text style={styles.trackName}>Toronto, Canada</Text>
                  <Text style={styles.trackPlays}>5% of plays</Text>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === 'time' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Analysis</Text>
              
              <Text style={styles.chartTitle}>Plays by Time of Day</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.chart, { height: 220, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <LineChart
                  data={timeData}
                  width={width - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={true}
                />
              )}
              
              <Text style={styles.sectionTitle}>Top Days of Week</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.chart, { height: 220, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={styles.chartPlaceholder}>Chart visualization available on mobile devices</Text>
                </View>
              ) : (
                <RNBarChart
                  data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    datasets: [
                      {
                        data: [65, 59, 80, 81, 90, 100, 70]
                      }
                    ]
                  }}
                  width={width - 32}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={styles.chart}
                  withInnerLines={false}
                  withHorizontalLabels={false}
                  fromZero={true}
                />
              )}
              
              <Text style={styles.sectionTitle}>Seasonal Trends</Text>
              <View style={styles.trackList}>
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>1</Text>
                  <Text style={styles.trackName}>Summer (Jun-Aug)</Text>
                  <Text style={styles.trackPlays}>35% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>2</Text>
                  <Text style={styles.trackName}>Spring (Mar-May)</Text>
                  <Text style={styles.trackPlays}>28% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>3</Text>
                  <Text style={styles.trackName}>Fall (Sep-Nov)</Text>
                  <Text style={styles.trackPlays}>22% of plays</Text>
                </View>
                
                <View style={styles.trackItem}>
                  <Text style={styles.trackRank}>4</Text>
                  <Text style={styles.trackName}>Winter (Dec-Feb)</Text>
                  <Text style={styles.trackPlays}>15% of plays</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  timeRangeContainer: {
    position: 'relative',
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  timeRangeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timeRangeDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    padding: 8,
    width: 150,
    zIndex: 10,
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
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  timeRangeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  timeRangeOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  timeRangeOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabs: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  activeTab: {
    backgroundColor: colors.cardElevated,
  },
  tabText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTrendText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  chart: {
    marginBottom: 24,
    borderRadius: 8,
  },
  chartPlaceholder: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trackList: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trackRank: {
    width: 24,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  trackName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  trackPlays: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  notLoggedInText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4169E1', // Royal blue
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});