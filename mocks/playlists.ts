import { Playlist } from '@/types/audio';

export const playlists: Playlist[] = [
  {
    id: '1',
    title: 'Chill Vibes',
    coverArt: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=500',
    trackIds: ['1', '4', '6', '8'],
    creatorId: '1',
    creatorName: 'Chill Wave',
    trackCount: 4,
    isPublic: true,
  },
  {
    id: '2',
    title: 'Night Drive',
    coverArt: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=500',
    trackIds: ['2', '5', '7'],
    creatorId: '2',
    creatorName: 'Neon Dreams',
    trackCount: 3,
    isPublic: true,
  },
  {
    id: '3',
    title: 'Urban Beats',
    coverArt: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=500',
    trackIds: ['3', '7', '5'],
    creatorId: '3',
    creatorName: 'Metro Beats',
    trackCount: 3,
    isPublic: true,
  },
  {
    id: '4',
    title: 'Relaxation',
    coverArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=500',
    trackIds: ['4', '6', '8'],
    creatorId: '4',
    creatorName: 'Aqua Sound',
    trackCount: 3,
    isPublic: true,
  }
];

export const featuredPlaylists = playlists.slice(0, 3);