import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Track } from '@/types/audio';
import TrackCard from './TrackCard';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { usePlayerStore } from '@/store/player-store';

export interface TrackListProps {
  title: string;
  tracks: Track[];
  showHeader?: boolean;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  testID?: string;
}

export default function TrackList({ 
  title, 
  tracks, 
  showHeader = true, 
  showViewAll = true,
  onViewAllPress,
  testID
}: TrackListProps) {
  const router = useRouter();
  const { playTrack } = usePlayerStore();
  
  const handleViewAll = () => {
    // Track view all click
    analyticsEventBus.publish('custom_event', {
      category: 'ui_interaction',
      action: 'view_all_click',
      list_title: title,
      track_count: tracks ? tracks.length : 0,
    });
    
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      // Default behavior - navigate to a list view
      router.push({
        pathname: '/tracks',
        params: { title, source: title.toLowerCase().replace(/\s+/g, '-') }
      });
    }
  };
  
  const handleTrackPress = (track: Track, index: number) => {
    // Track track selection
    analyticsEventBus.publish('custom_event', {
      category: 'content_interaction',
      action: 'track_select',
      track_id: track.id,
      track_title: track.title,
      list_title: title,
      position: index,
    });
    
    // Play the track
    playTrack(track);
  };
  
  // Ensure tracks is always an array
  const tracksArray = tracks || [];
  
  return (
    <View style={styles.container} testID={testID}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showViewAll && tracksArray.length > 0 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleViewAll}
              accessibilityLabel={`View all ${title}`}
              accessibilityHint={`Shows all tracks in ${title}`}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <FlatList
        data={tracksArray}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TrackCard 
            track={item} 
            onPress={() => handleTrackPress(item, index)}
            index={index}
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.trackList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  trackList: {
    paddingBottom: 8,
  },
});