import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import PlaylistCard from './PlaylistCard';
import { Playlist } from '@/types/audio';
import { colors } from '@/constants/colors';

interface PlaylistRowProps {
  title: string;
  playlists: Playlist[];
}

export default function PlaylistRow({ title, playlists }: PlaylistRowProps) {
  if (!playlists || playlists.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
});