import { User } from '@/types/audio';

export const users: User[] = [
  {
    id: '1',
    username: 'chillwave',
    displayName: 'Chill Wave',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    followers: 12453,
    following: 342,
    tracksCount: 28,
    bio: 'Creating chill electronic vibes for your relaxation needs.',
  },
  {
    id: '2',
    username: 'neondreams',
    displayName: 'Neon Dreams',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    followers: 8721,
    following: 156,
    tracksCount: 15,
    bio: 'Synthwave producer from Los Angeles. Retro vibes with modern production.',
  },
  {
    id: '3',
    username: 'metrobeats',
    displayName: 'Metro Beats',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
    followers: 15632,
    following: 423,
    tracksCount: 42,
    bio: 'Hip hop producer. Urban sounds straight from the streets.',
  },
  {
    id: '4',
    username: 'aquasound',
    displayName: 'Aqua Sound',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200',
    followers: 9876,
    following: 231,
    tracksCount: 19,
    bio: 'Ambient music producer inspired by nature and ocean sounds.',
  },
  {
    id: '5',
    username: 'synthmaster',
    displayName: 'Synth Master',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    followers: 11234,
    following: 187,
    tracksCount: 31,
    bio: 'Electronic music producer specializing in synthesizer-based compositions.',
  }
];

export const suggestedUsers = users.slice(0, 3);