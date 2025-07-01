export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverArt: string;
  audioUrl: string;
  duration: number;
  genre: string;
  releaseDate: string;
  isExplicit: boolean;
  isLiked?: boolean;
  playCount?: number;
  genres?: string[];
  plays: number;
  likes: number;
  waveformData?: number[];
  description?: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  followers?: string[];
  following?: string[];
  tracksCount?: number;
  playlists?: string[];
  createdAt?: number;
  isVerified?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  title: string;
  description?: string;
  coverArt?: string;
  tracks: string[];
  trackIds: string[];
  createdBy: string;
  creatorId: string;
  creatorName: string;
  trackCount: number;
  isPrivate: boolean;
  isPublic: boolean;
  createdAt: number;
  likes?: number;
  plays?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverArt: string;
  releaseDate: string;
  trackIds: string[];
  genre: string;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  genres?: string[];
  monthlyListeners?: number;
  isVerified?: boolean;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  timestamp: number;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface AudioQuality {
  type: 'low' | 'medium' | 'high' | 'lossless';
  bitrate: number;
  sampleRate?: number;
  fileSize?: number;
  url: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
}

export interface PlaybackQueue {
  current: Track | null;
  next: Track[];
  previous: Track[];
}

export interface AudioAnalysis {
  waveform: number[];
  tempo: number;
  key: string;
  loudness: number;
  sections: {
    start: number;
    duration: number;
    loudness: number;
    tempo: number;
    key: string;
  }[];
}

export interface Lyrics {
  id: string;
  trackId: string;
  lines: {
    startTime: number;
    endTime: number;
    text: string;
  }[];
  hasTimestamps: boolean;
  language: string;
  source: string;
}