import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import TrackCard from '@/components/TrackCard';
import UserCard from '@/components/UserCard';
import MiniPlayer from '@/components/MiniPlayer';
import StyledInput from '@/components/StyledInput';
import { tracks } from '@/mocks/tracks';
import { users } from '@/mocks/users';
import { colors } from '@/constants/colors';
import { usePlayerStore } from '@/store/player-store';
import { freqLogoUrl } from '@/constants/images';
import { useAnalytics } from '@/hooks/useAnalytics';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GENRES = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'R&B', 'Jazz', 
  'Classical', 'Ambient', 'Folk', 'Indie', 'Metal', 'Country'
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('top');
  const { currentTrack, isMinimized } = usePlayerStore();
  const analytics = useAnalytics();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const filteredTracks = searchQuery 
    ? tracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  const filteredUsers = searchQuery
    ? users.filter(user =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Track search when query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      // Debounce search tracking
      const timer = setTimeout(() => {
        analytics.trackSearch(searchQuery, filteredTracks.length + filteredUsers.length);
        setSearchPerformed(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);
  
  // Track search result clicks
  const handleTrackClick = (trackId: string, position: number) => {
    if (searchPerformed) {
      analyticsEventBus.publish('custom_event', {
        category: 'search',
        action: 'result_click',
        result_type: 'track',
        result_id: trackId,
        position,
        query: searchQuery,
      });
    }
  };
  
  const handleUserClick = (userId: string, position: number) => {
    if (searchPerformed) {
      analyticsEventBus.publish('custom_event', {
        category: 'search',
        action: 'result_click',
        result_type: 'user',
        result_id: userId,
        position,
        query: searchQuery,
      });
    }
    // Navigate to the user's profile
    router.push(`/profile/${userId}`);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchPerformed(false);
    
    analyticsEventBus.publish('custom_event', {
      category: 'search',
      action: 'clear_search',
    });
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    analyticsEventBus.publish('custom_event', {
      category: 'search',
      action: 'filter_apply',
      filter_type: 'tab',
      filter_value: tab,
      query: searchQuery,
    });
  };
  
  const handleGenreClick = (genre: string) => {
    setSearchQuery(genre);
    
    analyticsEventBus.publish('custom_event', {
      category: 'search',
      action: 'genre_click',
      genre,
    });
  };

  const handleLogoPress = () => {
    router.push('/(tabs)');
  };
  
  // Calculate content padding based on player state
  const getContentPaddingBottom = () => {
    const baseTabBarHeight = Platform.OS === 'ios' ? 80 + insets.bottom : 70;
    const miniPlayerHeight = 60;
    
    if (currentTrack && isMinimized) {
      return baseTabBarHeight + miniPlayerHeight;
    } else if (currentTrack && !isMinimized) {
      return 20; // Full player covers everything
    } else {
      return baseTabBarHeight;
    }
  };
  
  const renderSearchResults = () => {
    if (!searchQuery) return null;
    
    if (filteredTracks.length === 0 && filteredUsers.length === 0) {
      // Track no results
      if (searchPerformed) {
        analyticsEventBus.publish('custom_event', {
          category: 'search',
          action: 'no_results',
          query: searchQuery,
        });
      }
      
      return (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.searchResults}>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'top' && styles.activeTab]}
            onPress={() => handleTabChange('top')}
          >
            <Text style={[styles.tabText, activeTab === 'top' && styles.activeTabText]}>
              Top Results
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
            onPress={() => handleTabChange('tracks')}
          >
            <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
              Tracks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'artists' && styles.activeTab]}
            onPress={() => handleTabChange('artists')}
          >
            <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>
              Artists
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'top' && (
          <>
            {filteredUsers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Artists</Text>
                {filteredUsers.slice(0, 2).map((user, index) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onPress={() => handleUserClick(user.id, index)}
                  />
                ))}
              </View>
            )}
            
            {filteredTracks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tracks</Text>
                {filteredTracks.slice(0, 5).map((track, index) => (
                  <TrackCard 
                    key={track.id} 
                    track={track} 
                    onPress={() => handleTrackClick(track.id, index)}
                  />
                ))}
              </View>
            )}
          </>
        )}
        
        {activeTab === 'tracks' && (
          <FlatList
            data={filteredTracks}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <TrackCard 
                track={item} 
                onPress={() => handleTrackClick(item.id, index)}
              />
            )}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            removeClippedSubviews={Platform.OS === 'android'}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
          />
        )}
        
        {activeTab === 'artists' && (
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <UserCard 
                user={item} 
                onPress={() => handleUserClick(item.id, index)}
              />
            )}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            removeClippedSubviews={Platform.OS === 'android'}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
          />
        )}
      </View>
    );
  };
  
  const renderBrowseContent = () => {
    if (searchQuery) return null;
    
    return (
      <View style={styles.browseContent}>
        <Text style={styles.browseTitle}>Browse by Genre</Text>
        <View style={styles.genreGrid}>
          {GENRES.map(genre => (
            <TouchableOpacity 
              key={genre} 
              style={styles.genreItem}
              onPress={() => handleGenreClick(genre)}
            >
              <Text style={styles.genreText}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false 
      }} />
      
      <View style={styles.header}>
        <View style={styles.searchBarHeader}>
          <TouchableOpacity onPress={handleLogoPress}>
            <Image 
              source={{ uri: freqLogoUrl }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
        <View style={styles.searchContainer}>
          <StyledInput
            placeholder="Search tracks, artists, or genres"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            containerStyle={styles.styledSearchInput}
            onSubmitEditing={() => {
              if (searchQuery) {
                analyticsEventBus.publish('search_query', {
                  query: searchQuery,
                  result_count: filteredTracks.length + filteredUsers.length,
                  input_method: 'submit',
                });
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getContentPaddingBottom() }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderSearchResults()}
        {renderBrowseContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 12,
    marginLeft: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 60, // Increased height for better touch target
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: 60, // Match container height
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchResults: {
    marginBottom: 24,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noResultsText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  browseContent: {
    marginBottom: 24,
  },
  browseTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  genreText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  styledSearchInput: {
    flex: 1,
    maxWidth: '100%',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 10,
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 5,
  },
});