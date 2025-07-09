import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from '@/types/audio';
import { useUserStore } from './user-store';
import { analyticsEventBus } from '@/services/analytics-event-bus';
import { useNotificationsStore } from './notifications-store';

export type PlayerState = 'playing' | 'paused' | 'loading' | 'stopped';
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  isMinimized: boolean;
  waveformData: number[];
  
  // Player controls
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  
  // UI controls
  maximizePlayer: () => void;
  minimizePlayer: () => void;
  
  // Waveform controls
  generateWaveformData: () => void;
  
  // State updates (for internal use)
  setPlayerState: (state: PlayerState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

// Generate realistic waveform data
const generateRealisticWaveformData = (trackId?: string) => {
  // In a real app, this would fetch actual audio waveform data
  // For demo purposes, we'll generate a more realistic looking waveform
  
  // Number of data points
  const numPoints = 150;
  
  // Create a seed based on track ID for consistent waveforms per track
  const seed = trackId ? trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Date.now();
  
  // Use the seed to generate a pseudo-random sequence
  const seededRandom = (min: number, max: number, index: number) => {
    const x = Math.sin(seed + index) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };
  
  // Generate base waveform with some randomness but following a pattern
  const baseWaveform = Array.from({ length: numPoints }, (_, i: number) => {
    // Create a pattern with louder sections
    const position = i / numPoints;
    
    // Base amplitude follows a pattern (higher in middle, lower at ends)
    let baseAmplitude;
    
    if (position < 0.1 || position > 0.9) {
      // Intro and outro are quieter
      baseAmplitude = 0.2 + seededRandom(0, 0.3, i);
    } else if ((position > 0.25 && position < 0.4) || (position > 0.6 && position < 0.75)) {
      // Chorus sections are louder
      baseAmplitude = 0.6 + seededRandom(0, 0.4, i);
    } else {
      // Verses are medium volume
      baseAmplitude = 0.4 + seededRandom(0, 0.3, i);
    }
    
    // Add some randomness to make it look natural
    return baseAmplitude * (1 + seededRandom(-0.2, 0.2, i + numPoints));
  });
  
  // Smooth the waveform to make it look more natural
  const smoothedWaveform = baseWaveform.map((value, i, arr) => {
    if (i === 0 || i === arr.length - 1) return value;
    // Simple 3-point moving average
    return (arr[i - 1] + value + arr[i + 1]) / 3;
  });
  
  return smoothedWaveform;
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      history: [],
      playerState: 'stopped',
      currentTime: 0,
      duration: 0,
      volume: 1,
      repeatMode: 'off',
      shuffleEnabled: false,
      isMinimized: true,
      waveformData: generateRealisticWaveformData(),
      
      playTrack: (track: Track) => {
        const { currentTrack, history } = get();
        
        // Add current track to history if it exists
        if (currentTrack) {
          set({ history: [currentTrack, ...(history || []).slice(0, 19)] });
        }
        
        // Update recently played in user store
        const userState = useUserStore.getState();
        if (userState?.isLoggedIn && userState.addToRecentlyPlayed) {
          userState.addToRecentlyPlayed(track.id);
        }
        
        // Generate new waveform data for this track
        const newWaveformData = generateRealisticWaveformData(track.id);
        
        // Track play event in analytics
        try {
          analyticsEventBus.publish('track_play', {
            track_id: track.id,
            track_title: track.title,
            track_artist: track.artist,
            source: 'direct',
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        // Simulate play count notifications for demo
        // In a real app, this would be handled by the backend when milestones are reached
        setTimeout(() => {
          const notificationsStore = useNotificationsStore.getState();
          const playCount = Math.floor(Math.random() * 10000) + 100;
          const milestones = [100, 500, 1000, 5000, 10000];
          
          // 5% chance of triggering a milestone notification
          if (Math.random() < 0.05 && milestones.includes(playCount)) {
            notificationsStore.notifyTrackPlays(track.title, playCount);
          }
        }, 2000);
        
        set({ 
          currentTrack: track, 
          playerState: 'playing',
          currentTime: 0,
          isMinimized: true, // Keep player minimized when playing a new track
          waveformData: newWaveformData,
          duration: track.duration || Math.floor(Math.random() * 180) + 120 // Random duration between 2-5 minutes if not provided
        });
      },
      
      playQueue: (tracks: Track[]) => {
        if (!tracks || tracks.length === 0) return;
        
        // Play the first track and add the rest to the queue
        const firstTrack = tracks[0];
        const remainingTracks = tracks.slice(1);
        
        // Track queue play event
        try {
          analyticsEventBus.publish('custom_event', {
            category: 'player',
            action: 'play_queue',
            queue_length: tracks.length,
            first_track_id: firstTrack.id,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        // Play the first track
        get().playTrack(firstTrack);
        
        // Add remaining tracks to queue
        set({ queue: remainingTracks });
      },
      
      togglePlay: () => {
        const { playerState, currentTrack } = get();
        
        if (!currentTrack) return;
        
        try {
          if (playerState === 'playing') {
            // Track pause event
            analyticsEventBus.publish('track_pause', {
              track_id: currentTrack.id,
              track_title: currentTrack.title,
              current_time: get().currentTime,
              duration: get().duration,
            });
            
            set({ playerState: 'paused' });
          } else {
            // Track resume event
            analyticsEventBus.publish('track_play', {
              track_id: currentTrack.id,
              track_title: currentTrack.title,
              current_time: get().currentTime,
              duration: get().duration,
              action: 'resume',
            });
            
            set({ playerState: 'playing' });
          }
        } catch (error) {
          console.error('Error publishing analytics event:', error);
          
          // Still update the state even if analytics fails
          set({ 
            playerState: playerState === 'playing' ? 'paused' : 'playing'
          });
        }
      },
      
      pause: () => {
        const { currentTrack } = get();
        
        if (currentTrack) {
          try {
            // Track pause event
            analyticsEventBus.publish('track_pause', {
              track_id: currentTrack.id,
              track_title: currentTrack.title,
              current_time: get().currentTime,
              duration: get().duration,
            });
          } catch (error) {
            console.error('Error publishing analytics event:', error);
          }
        }
        
        set({ playerState: 'paused' });
      },
      
      stop: () => {
        const { currentTrack } = get();
        
        if (currentTrack) {
          try {
            // Track stop event
            analyticsEventBus.publish('custom_event', {
              category: 'player',
              action: 'stop',
              track_id: currentTrack.id,
              track_title: currentTrack.title,
              current_time: get().currentTime,
              duration: get().duration,
            });
          } catch (error) {
            console.error('Error publishing analytics event:', error);
          }
        }
        
        set({ 
          playerState: 'stopped',
          currentTime: 0
        });
      },
      
      seekTo: (time: number) => {
        const { currentTrack, currentTime } = get();
        
        if (currentTrack) {
          try {
            // Track seek event
            analyticsEventBus.publish('track_seek', {
              track_id: currentTrack.id,
              track_title: currentTrack.title,
              from_time: currentTime,
              to_time: time,
              duration: get().duration,
            });
          } catch (error) {
            console.error('Error publishing analytics event:', error);
          }
        }
        
        set({ currentTime: time });
      },
      
      playNext: () => {
        const { currentTrack, queue, history, repeatMode, shuffleEnabled } = get();
        
        if (!currentTrack) return;
        
        try {
          // Track skip event
          analyticsEventBus.publish('track_skip', {
            track_id: currentTrack.id,
            track_title: currentTrack.title,
            current_time: get().currentTime,
            duration: get().duration,
            direction: 'next',
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        // Add current track to history
        const newHistory = [currentTrack, ...((history || []).slice(0, 19))];
        
        // If queue is empty
        if (!queue || queue.length === 0) {
          // If repeat all is enabled, start from the beginning of history
          if (repeatMode === 'all' && history && history.length > 0) {
            const trackToPlay = shuffleEnabled 
              ? history[Math.floor(Math.random() * history.length)]
              : history[history.length - 1];
            
            set({
              currentTrack: trackToPlay,
              history: newHistory.filter(t => t.id !== trackToPlay.id),
              playerState: 'playing',
              currentTime: 0,
              waveformData: generateRealisticWaveformData(trackToPlay.id)
            });
          } 
          // If repeat one is enabled, replay the current track
          else if (repeatMode === 'one') {
            set({
              currentTime: 0,
              playerState: 'playing'
            });
          }
          // Otherwise, just stop
          else {
            set({
              history: newHistory,
              playerState: 'stopped'
            });
          }
          return;
        }
        
        // If there are tracks in the queue
        const nextTrackIndex = shuffleEnabled 
          ? Math.floor(Math.random() * queue.length)
          : 0;
        
        const nextTrack = queue[nextTrackIndex];
        const newQueue = queue.filter((_, i) => i !== nextTrackIndex);
        
        // Update recently played in user store
        const userState = useUserStore.getState();
        if (userState?.isLoggedIn && userState.addToRecentlyPlayed) {
          userState.addToRecentlyPlayed(nextTrack.id);
        }
        
        try {
          // Track next track play event
          analyticsEventBus.publish('track_play', {
            track_id: nextTrack.id,
            track_title: nextTrack.title,
            track_artist: nextTrack.artist,
            source: 'queue',
            previous_track_id: currentTrack.id,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({
          currentTrack: nextTrack,
          queue: newQueue,
          history: newHistory,
          playerState: 'playing',
          currentTime: 0,
          waveformData: generateRealisticWaveformData(nextTrack.id),
          duration: nextTrack.duration || Math.floor(Math.random() * 180) + 120
        });
      },
      
      playPrevious: () => {
        const { currentTrack, history, currentTime } = get();
        
        // If current track is playing for more than 3 seconds, restart it
        if (currentTime > 3) {
          // Track restart event
          if (currentTrack) {
            try {
              analyticsEventBus.publish('custom_event', {
                category: 'player',
                action: 'restart_track',
                track_id: currentTrack.id,
                track_title: currentTrack.title,
                current_time: currentTime,
              });
            } catch (error) {
              console.error('Error publishing analytics event:', error);
            }
          }
          
          set({ currentTime: 0 });
          return;
        }
        
        // If no history or no current track, do nothing
        if (!history || history.length === 0 || !currentTrack) return;
        
        try {
          // Track skip event
          analyticsEventBus.publish('track_skip', {
            track_id: currentTrack.id,
            track_title: currentTrack.title,
            current_time: currentTime,
            duration: get().duration,
            direction: 'previous',
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        const previousTrack = history[0];
        const newHistory = history.slice(1);
        
        try {
          // Track previous track play event
          analyticsEventBus.publish('track_play', {
            track_id: previousTrack.id,
            track_title: previousTrack.title,
            track_artist: previousTrack.artist,
            source: 'history',
            next_track_id: currentTrack.id,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        // Add current track to queue at the beginning
        const currentQueue = get().queue || [];
        set({
          currentTrack: previousTrack,
          queue: currentTrack ? [currentTrack, ...currentQueue] : [...currentQueue],
          history: newHistory,
          playerState: 'playing',
          currentTime: 0,
          waveformData: generateRealisticWaveformData(previousTrack.id),
          duration: previousTrack.duration || Math.floor(Math.random() * 180) + 120
        });
      },
      
      addToQueue: (track: Track) => {
        const currentQueue = get().queue || [];
        
        try {
          // Track add to queue event
          analyticsEventBus.publish('custom_event', {
            category: 'player',
            action: 'add_to_queue',
            track_id: track.id,
            track_title: track.title,
            queue_length: currentQueue.length,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ queue: [...currentQueue, track] });
      },
      
      removeFromQueue: (index: number) => {
        const currentQueue = get().queue || [];
        if (!currentQueue || index >= currentQueue.length) return;
        
        const track = currentQueue[index];
        
        if (track) {
          try {
            // Track remove from queue event
            analyticsEventBus.publish('custom_event', {
              category: 'player',
              action: 'remove_from_queue',
              track_id: track.id,
              track_title: track.title,
              queue_position: index,
              queue_length: currentQueue.length,
            });
          } catch (error) {
            console.error('Error publishing analytics event:', error);
          }
        }
        
        const newQueue = [...currentQueue];
        newQueue.splice(index, 1);
        set({ queue: newQueue });
      },
      
      clearQueue: () => {
        const currentQueue = get().queue || [];
        
        try {
          // Track clear queue event
          analyticsEventBus.publish('custom_event', {
            category: 'player',
            action: 'clear_queue',
            queue_length: currentQueue.length,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ queue: [] });
      },
      
      toggleRepeat: () => {
        const { repeatMode } = get();
        
        let newMode: RepeatMode;
        if (repeatMode === 'off') {
          newMode = 'all';
        } else if (repeatMode === 'all') {
          newMode = 'one';
        } else {
          newMode = 'off';
        }
        
        try {
          // Track repeat mode change
          analyticsEventBus.publish('custom_event', {
            category: 'player',
            action: 'toggle_repeat',
            previous_mode: repeatMode,
            new_mode: newMode,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ repeatMode: newMode });
      },
      
      toggleShuffle: () => {
        const newShuffleState = !get().shuffleEnabled;
        
        try {
          // Track shuffle mode change
          analyticsEventBus.publish('custom_event', {
            category: 'player',
            action: 'toggle_shuffle',
            enabled: newShuffleState,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ shuffleEnabled: newShuffleState });
      },
      
      setVolume: (volume: number) => {
        try {
          // Track volume change
          analyticsEventBus.publish('custom_event', {
            category: 'player',
            action: 'volume_change',
            previous_volume: get().volume,
            new_volume: volume,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ volume });
      },
      
      maximizePlayer: () => {
        const currentTrack = get().currentTrack;
        
        try {
          // Track player maximize
          analyticsEventBus.publish('custom_event', {
            category: 'ui',
            action: 'maximize_player',
            track_id: currentTrack?.id,
            track_title: currentTrack?.title,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ isMinimized: false });
      },
      
      minimizePlayer: () => {
        const currentTrack = get().currentTrack;
        
        try {
          // Track player minimize
          analyticsEventBus.publish('custom_event', {
            category: 'ui',
            action: 'minimize_player',
            track_id: currentTrack?.id,
            track_title: currentTrack?.title,
          });
        } catch (error) {
          console.error('Error publishing analytics event:', error);
        }
        
        set({ isMinimized: true });
      },
      
      generateWaveformData: () => {
        const { currentTrack } = get();
        const newWaveformData = generateRealisticWaveformData(currentTrack?.id);
        set({ waveformData: newWaveformData });
      },
      
      setPlayerState: (state: PlayerState) => {
        set({ playerState: state });
      },
      
      setCurrentTime: (time: number) => {
        set({ currentTime: time });
        
        // Auto-play next track when current track ends
        const { duration, currentTrack } = get();
        if (time >= duration - 0.5 && currentTrack) {
          try {
            // Track completion event
            analyticsEventBus.publish('track_complete', {
              track_id: currentTrack.id,
              track_title: currentTrack.title,
              duration: duration,
            });
          } catch (error) {
            console.error('Error publishing analytics event:', error);
          }
          
          get().playNext();
        }
      },
      
      setDuration: (duration: number) => {
        set({ duration });
      }
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        volume: state.volume,
        repeatMode: state.repeatMode,
        shuffleEnabled: state.shuffleEnabled,
      }),
    }
  )
);