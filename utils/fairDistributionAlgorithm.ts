import { Track } from '@/types/audio';

// Define weights for different factors
const WEIGHTS = {
  RECENCY: 0.3,
  POPULARITY: 0.2,
  USER_PREFERENCE: 0.4,
  FRESHNESS: 0.1,
};

// Interface for track with score
interface ScoredTrack extends Track {
  score: number;
}

/**
 * Fair Distribution Algorithm for music recommendations
 * 
 * This algorithm aims to provide a fair distribution of tracks based on:
 * 1. Recency - How recently the track was released
 * 2. Popularity - How popular the track is (plays, likes)
 * 3. User Preference - Based on user's listening history and likes
 * 4. Freshness - Prioritizing tracks the user hasn't heard before
 * 
 * It also ensures diversity by:
 * - Not recommending too many tracks from the same artist
 * - Balancing between popular and niche tracks
 * - Including some completely new discoveries
 */
export function generateRecommendations(
  allTracks: Track[],
  userHistory: string[] = [], // IDs of tracks the user has listened to
  userLikes: string[] = [], // IDs of tracks the user has liked
  count: number = 10
): Track[] {
  // Filter out tracks the user has already heard too many times
  const overplayedThreshold = 5;
  const tracksWithPlayCount = new Map<string, number>();
  
  userHistory.forEach(trackId => {
    tracksWithPlayCount.set(trackId, (tracksWithPlayCount.get(trackId) || 0) + 1);
  });
  
  // Filter out overplayed tracks but keep liked tracks
  const eligibleTracks = allTracks.filter(track => {
    const playCount = tracksWithPlayCount.get(track.id) || 0;
    return playCount < overplayedThreshold || userLikes.includes(track.id);
  });
  
  // Calculate scores for each track
  const scoredTracks: ScoredTrack[] = eligibleTracks.map(track => {
    // Calculate recency score (newer tracks get higher scores)
    const releaseDate = new Date(track.releaseDate);
    const now = new Date();
    const ageInDays = Math.max(0, (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const recencyScore = Math.max(0, 1 - (ageInDays / 365)); // Newer = higher score
    
    // Calculate popularity score
    const playsNormalized = Math.min(1, track.plays / 1000000); // Normalize plays (cap at 1M)
    const likesNormalized = Math.min(1, track.likes / 100000); // Normalize likes (cap at 100K)
    const popularityScore = (playsNormalized * 0.7) + (likesNormalized * 0.3);
    
    // Calculate user preference score
    const hasListened = userHistory.includes(track.id);
    const hasLiked = userLikes.includes(track.id);
    const userPreferenceScore = hasLiked ? 1 : (hasListened ? 0.5 : 0);
    
    // Calculate freshness score (tracks user hasn't heard get higher scores)
    const freshnessScore = userHistory.includes(track.id) ? 0 : 1;
    
    // Calculate final score
    const score = (
      (recencyScore * WEIGHTS.RECENCY) +
      (popularityScore * WEIGHTS.POPULARITY) +
      (userPreferenceScore * WEIGHTS.USER_PREFERENCE) +
      (freshnessScore * WEIGHTS.FRESHNESS)
    );
    
    return {
      ...track,
      score,
    };
  });
  
  // Sort tracks by score
  scoredTracks.sort((a, b) => b.score - a.score);
  
  // Ensure artist diversity (limit tracks from the same artist)
  const artistCounts = new Map<string, number>();
  const maxTracksPerArtist = Math.max(1, Math.floor(count * 0.3)); // Max 30% from same artist
  
  const diverseTracks: ScoredTrack[] = [];
  for (const track of scoredTracks) {
    const artistCount = artistCounts.get(track.artistId) || 0;
    if (artistCount < maxTracksPerArtist) {
      diverseTracks.push(track);
      artistCounts.set(track.artistId, artistCount + 1);
    }
    
    if (diverseTracks.length >= count * 2) break; // Get 2x what we need for further processing
  }
  
  // Ensure we have enough tracks
  if (diverseTracks.length < count) {
    // Add more tracks if we don't have enough after diversity filtering
    for (const track of scoredTracks) {
      if (!diverseTracks.some(t => t.id === track.id)) {
        diverseTracks.push(track);
        if (diverseTracks.length >= count * 2) break;
      }
    }
  }
  
  // Final selection with some randomness to avoid always showing the same recommendations
  const finalTracks: Track[] = [];
  
  // Add top 50% based on score
  const topHalfCount = Math.floor(count * 0.5);
  finalTracks.push(...diverseTracks.slice(0, topHalfCount));
  
  // Add remaining tracks with some randomness
  const remainingTracks = diverseTracks.slice(topHalfCount);
  const remainingCount = count - topHalfCount;
  
  for (let i = 0; i < remainingCount && remainingTracks.length > 0; i++) {
    // Add some randomness to the selection
    const randomIndex = Math.floor(Math.random() * Math.min(remainingTracks.length, 10));
    finalTracks.push(remainingTracks[randomIndex]);
    remainingTracks.splice(randomIndex, 1);
  }
  
  // Ensure we have exactly the requested number of tracks
  return finalTracks.slice(0, count);
}

// Function to generate trending tracks based on recent popularity
export function generateTrendingTracks(allTracks: Track[], count: number = 10): Track[] {
  // Calculate trending score based on recent plays and likes
  const trendingTracks = allTracks.map(track => {
    // Recency factor - newer tracks get a boost
    const releaseDate = new Date(track.releaseDate);
    const now = new Date();
    const ageInDays = Math.max(0, (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const recencyFactor = Math.max(0.5, 1 - (ageInDays / 30)); // Newer tracks (< 30 days) get a boost
    
    // Popularity factor
    const popularityFactor = (track.plays / 10000) + (track.likes / 1000);
    
    // Trending score combines recency and popularity
    const trendingScore = popularityFactor * recencyFactor;
    
    return {
      ...track,
      score: trendingScore,
    };
  });
  
  // Sort by trending score
  trendingTracks.sort((a, b) => b.score - a.score);
  
  // Return top trending tracks
  return trendingTracks.slice(0, count);
}

// Function to generate new releases
export function generateNewReleases(allTracks: Track[], count: number = 10): Track[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // Filter tracks released in the last 30 days
  const recentTracks = allTracks.filter(track => {
    const releaseDate = new Date(track.releaseDate);
    return releaseDate >= thirtyDaysAgo;
  });
  
  // Sort by release date (newest first)
  recentTracks.sort((a, b) => {
    const dateA = new Date(a.releaseDate);
    const dateB = new Date(b.releaseDate);
    return dateB.getTime() - dateA.getTime();
  });
  
  // If we don't have enough recent tracks, add some older ones
  if (recentTracks.length < count) {
    const olderTracks = allTracks
      .filter(track => !recentTracks.some(rt => rt.id === track.id))
      .sort((a, b) => {
        const dateA = new Date(a.releaseDate);
        const dateB = new Date(b.releaseDate);
        return dateB.getTime() - dateA.getTime();
      });
    
    recentTracks.push(...olderTracks.slice(0, count - recentTracks.length));
  }
  
  return recentTracks.slice(0, count);
}

// Function to generate featured tracks (editorially curated)
export function generateFeaturedTracks(allTracks: Track[], count: number = 10): Track[] {
  // In a real app, this would be editorially curated or based on special promotions
  // For this mock, we'll select a diverse set of tracks with good popularity
  
  // Group tracks by genre
  const tracksByGenre = new Map<string, Track[]>();
  
  allTracks.forEach(track => {
    const genre = track.genre || 'Unknown';
    if (!tracksByGenre.has(genre)) {
      tracksByGenre.set(genre, []);
    }
    tracksByGenre.get(genre)?.push(track);
  });
  
  // Select top tracks from each genre
  const featuredTracks: Track[] = [];
  const genresNeeded = Math.min(tracksByGenre.size, Math.ceil(count / 2));
  
  // Sort genres by number of tracks (descending)
  const sortedGenres = Array.from(tracksByGenre.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, genresNeeded);
  
  // Take top tracks from each genre
  sortedGenres.forEach(([genre, tracks]) => {
    // Sort tracks by popularity
    const sortedTracks = [...tracks].sort((a, b) => {
      const scoreA = (a.plays / 10000) + (a.likes / 1000);
      const scoreB = (b.plays / 10000) + (b.likes / 1000);
      return scoreB - scoreA;
    });
    
    // Take top 2 tracks from each genre
    featuredTracks.push(...sortedTracks.slice(0, 2));
  });
  
  // If we need more tracks, add some popular ones
  if (featuredTracks.length < count) {
    const popularTracks = allTracks
      .filter(track => !featuredTracks.some(ft => ft.id === track.id))
      .sort((a, b) => {
        const scoreA = (a.plays / 10000) + (a.likes / 1000);
        const scoreB = (b.plays / 10000) + (b.likes / 1000);
        return scoreB - scoreA;
      });
    
    featuredTracks.push(...popularTracks.slice(0, count - featuredTracks.length));
  }
  
  // Shuffle the tracks to avoid predictable ordering
  return shuffleArray(featuredTracks.slice(0, count));
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}