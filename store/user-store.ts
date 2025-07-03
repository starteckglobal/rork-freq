import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/id';
import { analyticsEventBus } from '@/services/analytics-event-bus';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  followers: string[];
  following: string[];
  createdAt: string;
  isVerified: boolean;
  isPremium: boolean;
  subscription?: {
    plan: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  };
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    soundcloud?: string;
    youtube?: string;
  };
  stats: {
    totalPlays: number;
    totalLikes: number;
    totalFollowers: number;
    totalFollowing: number;
    totalTracks: number;
    totalPlaylists: number;
  };
  tracksCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  tracks: string[];
  createdBy: string;
  createdAt: string | number;
  isPrivate: boolean;
  likes?: number;
  plays?: number;
}

export interface UserState {
  isLoggedIn: boolean;
  currentUser: User | null;
  likedTracks: string[];
  likedPlaylists: string[];
  recentlyPlayed: string[];
  userPlaylists: Playlist[];
  showLoginModal: boolean;
  
  // Authentication
  login: (username: string, password: string) => Promise<boolean>;
  register: (user: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  setShowLoginModal: (show: boolean) => void;
  
  // User profile
  updateProfile: (updates: Partial<User>) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  
  // Subscription
  isSubscribed: () => boolean;
  
  // Tracks
  likeTrack: (trackId: string) => void;
  unlikeTrack: (trackId: string) => void;
  isTrackLiked: (trackId: string) => boolean;
  addToRecentlyPlayed: (trackId: string) => void;
  
  // Playlists
  createPlaylist: (name: string, description?: string, isPrivate?: boolean, coverArt?: string | null) => string;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  likePlaylist: (playlistId: string) => void;
  unlikePlaylist: (playlistId: string) => void;
  isPlaylistLiked: (playlistId: string) => boolean;
  
  // Premium
  upgradeToPremium: () => void;
  cancelPremium: () => void;
  
  // Subscription
  subscribeToPlan: (planId: string) => void;
}

// Mock user for development
const mockUser: User = {
  id: 'user-1',
  username: 'musiclover',
  displayName: 'Music Lover',
  email: 'user@example.com',
  bio: 'Just a music enthusiast exploring new sounds and rhythms.',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  coverImageUrl: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWMlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  followers: ['user-2', 'user-3'],
  following: ['user-4', 'user-5'],
  createdAt: '2023-01-15T12:00:00Z',
  isVerified: true,
  isPremium: false,
  socialLinks: {
    website: 'https://example.com',
    twitter: 'musiclover',
    instagram: 'musiclover',
    soundcloud: 'musiclover',
  },
  stats: {
    totalPlays: 12500,
    totalLikes: 450,
    totalFollowers: 120,
    totalFollowing: 85,
    totalTracks: 15,
    totalPlaylists: 8,
  },
  tracksCount: 15,
};

// Mock playlists for development
const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'My Favorites',
    description: 'A collection of my all-time favorite tracks',
    coverArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fG11c2ljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    tracks: ['track-1', 'track-3', 'track-5'],
    createdBy: 'user-1',
    createdAt: '2023-02-10T15:30:00Z',
    isPrivate: false,
    likes: 45,
    plays: 1200,
  },
  {
    id: 'playlist-2',
    name: 'Chill Vibes',
    description: 'Perfect for relaxing and unwinding',
    coverArt: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fG11c2ljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    tracks: ['track-2', 'track-4', 'track-6'],
    createdBy: 'user-1',
    createdAt: '2023-03-05T09:15:00Z',
    isPrivate: false,
    likes: 32,
    plays: 980,
  },
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      currentUser: null,
      likedTracks: [],
      likedPlaylists: [],
      recentlyPlayed: [],
      userPlaylists: [],
      showLoginModal: false,
      
      // Authentication
      login: async (username, password) => {
        // In a real app, this would make an API call
        // For demo purposes, we'll just simulate a successful login with the mock user
        
        // Track login attempt
        analyticsEventBus.publish('custom_event', {
          category: 'auth',
          action: 'login_attempt',
          username,
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (username === 'demo' && password === 'password') {
          set({
            isLoggedIn: true,
            currentUser: mockUser,
            userPlaylists: mockPlaylists,
            showLoginModal: false,
          });
          
          // Track successful login
          analyticsEventBus.publish('user_login', {
            user_id: mockUser.id,
            username: mockUser.username,
            is_premium: mockUser.isPremium,
          });
          
          return true;
        }
        
        // Track failed login
        analyticsEventBus.publish('custom_event', {
          category: 'auth',
          action: 'login_failed',
          username,
          reason: 'invalid_credentials',
        });
        
        return false;
      },
      
      register: async (user, password) => {
        // In a real app, this would make an API call
        // For demo purposes, we'll just simulate a successful registration
        
        // Track registration attempt
        analyticsEventBus.publish('custom_event', {
          category: 'auth',
          action: 'register_attempt',
          email: user.email,
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newUser: User = {
          id: generateId(),
          username: user.username || 'user',
          displayName: user.displayName || user.username || 'New User',
          email: user.email || 'user@example.com',
          bio: user.bio || '',
          avatarUrl: user.avatarUrl,
          coverImageUrl: user.coverImageUrl,
          followers: [],
          following: [],
          createdAt: new Date().toISOString(),
          isVerified: false,
          isPremium: false,
          socialLinks: user.socialLinks || {},
          stats: {
            totalPlays: 0,
            totalLikes: 0,
            totalFollowers: 0,
            totalFollowing: 0,
            totalTracks: 0,
            totalPlaylists: 0,
          },
          tracksCount: 0,
        };
        
        set({
          isLoggedIn: true,
          currentUser: newUser,
          userPlaylists: [],
          showLoginModal: false,
        });
        
        // Track successful registration
        analyticsEventBus.publish('custom_event', {
          category: 'auth',
          action: 'register_success',
          user_id: newUser.id,
          username: newUser.username,
        });
        
        return true;
      },
      
      logout: () => {
        const userId = get().currentUser?.id;
        
        set({
          isLoggedIn: false,
          currentUser: null,
          likedTracks: [],
          likedPlaylists: [],
          userPlaylists: [],
        });
        
        // Track logout
        if (userId) {
          analyticsEventBus.publish('user_logout', {
            user_id: userId,
          });
        }
      },
      
      setShowLoginModal: (show) => {
        set({ showLoginModal: show });
        
        // Track modal visibility change
        analyticsEventBus.publish('custom_event', {
          category: 'ui_interaction',
          action: show ? 'login_modal_open' : 'login_modal_close',
        });
      },
      
      // User profile
      updateProfile: (updates) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, ...updates };
        set({ currentUser: updatedUser });
        
        // Track profile update
        analyticsEventBus.publish('user_profile_update', {
          user_id: currentUser.id,
          updated_fields: Object.keys(updates),
        });
      },
      
      followUser: (userId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        // Don't follow yourself
        if (userId === currentUser.id) return;
        
        // Check if already following
        if (currentUser.following.includes(userId)) return;
        
        const updatedFollowing = [...currentUser.following, userId];
        const updatedStats = {
          ...currentUser.stats,
          totalFollowing: currentUser.stats.totalFollowing + 1
        };
        
        const updatedUser = {
          ...currentUser,
          following: updatedFollowing,
          stats: updatedStats
        };
        
        set({ currentUser: updatedUser });
        
        // Track follow
        analyticsEventBus.publish('user_follow', {
          user_id: currentUser.id,
          followed_user_id: userId,
        });
      },
      
      unfollowUser: (userId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        // Check if not following
        if (!currentUser.following.includes(userId)) return;
        
        const updatedFollowing = currentUser.following.filter(id => id !== userId);
        const updatedStats = {
          ...currentUser.stats,
          totalFollowing: Math.max(0, currentUser.stats.totalFollowing - 1)
        };
        
        const updatedUser = {
          ...currentUser,
          following: updatedFollowing,
          stats: updatedStats
        };
        
        set({ currentUser: updatedUser });
        
        // Track unfollow
        analyticsEventBus.publish('user_unfollow', {
          user_id: currentUser.id,
          unfollowed_user_id: userId,
        });
      },
      
      isFollowing: (userId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return false;
        
        return currentUser.following.includes(userId);
      },
      
      // Subscription status
      isSubscribed: () => {
        const { currentUser } = get();
        if (!currentUser) return false;
        
        // Check if user has premium status
        if (currentUser.isPremium) return true;
        
        // Check if user has an active subscription
        if (currentUser.subscription) {
          const now = new Date();
          const endDate = new Date(currentUser.subscription.endDate);
          return endDate > now;
        }
        
        return false;
      },
      
      // Tracks
      likeTrack: (trackId) => {
        const { likedTracks, isLoggedIn, currentUser } = get();
        
        if (!isLoggedIn) {
          set({ showLoginModal: true });
          return;
        }
        
        // Check if already liked
        if (likedTracks && likedTracks.includes(trackId)) return;
        
        // Initialize likedTracks as an empty array if it's undefined
        const updatedLikedTracks = likedTracks ? [...likedTracks, trackId] : [trackId];
        set({ likedTracks: updatedLikedTracks });
        
        // Track like
        analyticsEventBus.publish('track_like', {
          user_id: currentUser?.id,
          track_id: trackId,
        });
      },
      
      unlikeTrack: (trackId) => {
        const { likedTracks, currentUser } = get();
        
        // Check if not liked or likedTracks is undefined
        if (!likedTracks || !likedTracks.includes(trackId)) return;
        
        const updatedLikedTracks = likedTracks.filter(id => id !== trackId);
        set({ likedTracks: updatedLikedTracks });
        
        // Track unlike
        analyticsEventBus.publish('track_unlike', {
          user_id: currentUser?.id,
          track_id: trackId,
        });
      },
      
      isTrackLiked: (trackId) => {
        const { likedTracks } = get();
        // Safely check if track is liked - ensure likedTracks is an array before calling includes
        return likedTracks ? likedTracks.includes(trackId) : false;
      },
      
      addToRecentlyPlayed: (trackId) => {
        const { recentlyPlayed } = get();
        
        // Remove if already exists (to move it to the front)
        const filteredRecent = recentlyPlayed ? recentlyPlayed.filter(id => id !== trackId) : [];
        
        // Add to the beginning of the array
        const updatedRecentlyPlayed = [trackId, ...filteredRecent];
        
        // Limit to 20 items
        if (updatedRecentlyPlayed.length > 20) {
          updatedRecentlyPlayed.pop();
        }
        
        set({ recentlyPlayed: updatedRecentlyPlayed });
      },
      
      // Playlists
      createPlaylist: (name, description = '', isPrivate = false, coverArt = null) => {
        const { userPlaylists, currentUser } = get();
        
        if (!currentUser) {
          set({ showLoginModal: true });
          return '';
        }
        
        const newPlaylist: Playlist = {
          id: generateId(),
          name,
          description,
          coverArt: coverArt || undefined,
          tracks: [],
          createdBy: currentUser.id,
          createdAt: new Date().toISOString(),
          isPrivate,
          likes: 0,
          plays: 0,
        };
        
        const updatedPlaylists = [...userPlaylists, newPlaylist];
        set({ userPlaylists: updatedPlaylists });
        
        // Track playlist creation
        analyticsEventBus.publish('playlist_create', {
          user_id: currentUser.id,
          playlist_id: newPlaylist.id,
          playlist_name: name,
          is_private: isPrivate,
          has_cover_art: !!coverArt,
        });
        
        return newPlaylist.id;
      },
      
      updatePlaylist: (playlistId, updates) => {
        const { userPlaylists, currentUser } = get();
        
        if (!currentUser) return;
        
        const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
        if (playlistIndex === -1) return;
        
        // Check if user owns the playlist
        if (userPlaylists[playlistIndex].createdBy !== currentUser.id) return;
        
        const updatedPlaylist = { ...userPlaylists[playlistIndex], ...updates };
        const updatedPlaylists = [...userPlaylists];
        updatedPlaylists[playlistIndex] = updatedPlaylist;
        
        set({ userPlaylists: updatedPlaylists });
        
        // Track playlist update
        analyticsEventBus.publish('playlist_update', {
          user_id: currentUser.id,
          playlist_id: playlistId,
          updated_fields: Object.keys(updates),
        });
      },
      
      deletePlaylist: (playlistId) => {
        const { userPlaylists, currentUser } = get();
        
        if (!currentUser) return;
        
        const playlist = userPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        // Check if user owns the playlist
        if (playlist.createdBy !== currentUser.id) return;
        
        const updatedPlaylists = userPlaylists.filter(p => p.id !== playlistId);
        set({ userPlaylists: updatedPlaylists });
        
        // Track playlist deletion
        analyticsEventBus.publish('custom_event', {
          category: 'playlist',
          action: 'delete',
          user_id: currentUser.id,
          playlist_id: playlistId,
        });
      },
      
      addTrackToPlaylist: (playlistId, trackId) => {
        const { userPlaylists, currentUser } = get();
        
        if (!currentUser) {
          set({ showLoginModal: true });
          return;
        }
        
        const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
        if (playlistIndex === -1) return;
        
        // Check if user owns the playlist
        if (userPlaylists[playlistIndex].createdBy !== currentUser.id) return;
        
        // Check if track is already in the playlist
        if (userPlaylists[playlistIndex].tracks.includes(trackId)) return;
        
        const updatedTracks = [...userPlaylists[playlistIndex].tracks, trackId];
        const updatedPlaylist = { ...userPlaylists[playlistIndex], tracks: updatedTracks };
        const updatedPlaylists = [...userPlaylists];
        updatedPlaylists[playlistIndex] = updatedPlaylist;
        
        set({ userPlaylists: updatedPlaylists });
        
        // Track add to playlist
        analyticsEventBus.publish('track_add_to_playlist', {
          user_id: currentUser.id,
          track_id: trackId,
          playlist_id: playlistId,
          playlist_name: updatedPlaylist.name,
        });
      },
      
      removeTrackFromPlaylist: (playlistId, trackId) => {
        const { userPlaylists, currentUser } = get();
        
        if (!currentUser) return;
        
        const playlistIndex = userPlaylists.findIndex(p => p.id === playlistId);
        if (playlistIndex === -1) return;
        
        // Check if user owns the playlist
        if (userPlaylists[playlistIndex].createdBy !== currentUser.id) return;
        
        const updatedTracks = userPlaylists[playlistIndex].tracks.filter(id => id !== trackId);
        const updatedPlaylist = { ...userPlaylists[playlistIndex], tracks: updatedTracks };
        const updatedPlaylists = [...userPlaylists];
        updatedPlaylists[playlistIndex] = updatedPlaylist;
        
        set({ userPlaylists: updatedPlaylists });
        
        // Track remove from playlist
        analyticsEventBus.publish('track_remove_from_playlist', {
          user_id: currentUser.id,
          track_id: trackId,
          playlist_id: playlistId,
          playlist_name: updatedPlaylist.name,
        });
      },
      
      likePlaylist: (playlistId) => {
        const { likedPlaylists, isLoggedIn, currentUser } = get();
        
        if (!isLoggedIn) {
          set({ showLoginModal: true });
          return;
        }
        
        // Check if already liked
        if (likedPlaylists && likedPlaylists.includes(playlistId)) return;
        
        // Initialize likedPlaylists as an empty array if it's undefined
        const updatedLikedPlaylists = likedPlaylists ? [...likedPlaylists, playlistId] : [playlistId];
        set({ likedPlaylists: updatedLikedPlaylists });
        
        // Track playlist like
        analyticsEventBus.publish('playlist_like', {
          user_id: currentUser?.id,
          playlist_id: playlistId,
        });
      },
      
      unlikePlaylist: (playlistId) => {
        const { likedPlaylists, currentUser } = get();
        
        // Check if not liked or likedPlaylists is undefined
        if (!likedPlaylists || !likedPlaylists.includes(playlistId)) return;
        
        const updatedLikedPlaylists = likedPlaylists.filter(id => id !== playlistId);
        set({ likedPlaylists: updatedLikedPlaylists });
        
        // Track playlist unlike
        analyticsEventBus.publish('playlist_unlike', {
          user_id: currentUser?.id,
          playlist_id: playlistId,
        });
      },
      
      isPlaylistLiked: (playlistId) => {
        const { likedPlaylists } = get();
        // Safely check if playlist is liked - ensure likedPlaylists is an array before calling includes
        return likedPlaylists ? likedPlaylists.includes(playlistId) : false;
      },
      
      // Premium
      upgradeToPremium: () => {
        const { currentUser } = get();
        
        if (!currentUser) {
          set({ showLoginModal: true });
          return;
        }
        
        const updatedUser = { ...currentUser, isPremium: true };
        set({ currentUser: updatedUser });
        
        // Track premium upgrade
        analyticsEventBus.publish('custom_event', {
          category: 'subscription',
          action: 'premium_upgrade',
          user_id: currentUser.id,
        });
      },
      
      cancelPremium: () => {
        const { currentUser } = get();
        
        if (!currentUser || !currentUser.isPremium) return;
        
        const updatedUser = { ...currentUser, isPremium: false };
        set({ currentUser: updatedUser });
        
        // Track premium cancellation
        analyticsEventBus.publish('custom_event', {
          category: 'subscription',
          action: 'premium_cancel',
          user_id: currentUser.id,
        });
      },
      
      // Subscription
      subscribeToPlan: (planId) => {
        const { currentUser } = get();
        
        if (!currentUser) {
          set({ showLoginModal: true });
          return;
        }
        
        // Create subscription dates
        const startDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Default to 1 year subscription
        
        const updatedUser = { 
          ...currentUser, 
          isPremium: true,
          subscription: {
            plan: planId,
            startDate,
            endDate: endDate.toISOString(),
            autoRenew: true
          }
        };
        
        set({ currentUser: updatedUser });
        
        // Track subscription
        analyticsEventBus.publish('custom_event', {
          category: 'subscription',
          action: 'subscribe',
          user_id: currentUser.id,
          plan_id: planId
        });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
        likedTracks: state.likedTracks,
        likedPlaylists: state.likedPlaylists,
        recentlyPlayed: state.recentlyPlayed,
        userPlaylists: state.userPlaylists,
      }),
    }
  )
);