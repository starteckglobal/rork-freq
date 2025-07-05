import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Settings, 
  Upload, 
  LogOut, 
  Edit, 
  Share2, 
  Users, 
  Music, 
  Heart, 
  Clock, 
  BarChart,
  Zap,
  Inbox,
  MessageSquare,
  Play,
  Crown,
  Star
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { usePlayerStore } from '@/store/player-store';
import { defaultAvatarUri, freqLogoUrl } from '@/constants/images';
import MiniPlayer from '@/components/MiniPlayer';
import LoginModal from '@/components/LoginModal';
import UploadTrackModal from '@/components/UploadTrackModal';
import { tracks } from '@/mocks/tracks';
import FollowersModal from '@/components/FollowersModal';
import { users } from '@/mocks/users';
import { Track } from '@/types/audio';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { 
    isLoggedIn, 
    currentUser, 
    likedTracks, 
    setShowLoginModal, 
    showLoginModal, 
    logout,
    isSubscribed
  } = useUserStore();
  const { currentTrack, isMinimized, playTrack } = usePlayerStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const router = useRouter();
  
  // Get followers and following from user store or default to empty arrays
  const following = currentUser?.following || [];
  const followers = currentUser?.followers || [];
  
  // Filter liked tracks
  const likedTracksList = tracks.filter(track => likedTracks?.includes(track.id) || false);
  
  // Filter user tracks (if logged in)
  const userTracks = isLoggedIn && currentUser 
    ? tracks.filter(track => track.artistId === currentUser.id)
    : [];
  
  // Get followers and following users - with null checks
  const followerUsers = users.filter(user => followers?.includes(user.id) || false);
  const followingUsers = users.filter(user => following?.includes(user.id) || false);
  
  // Check if user is subscribed
  const hasSubscription = isSubscribed();
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            logout();
            router.push('/');
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleUpload = () => {
    if (isLoggedIn) {
      setShowUploadModal(true);
    } else {
      setShowLoginModal(true);
    }
  };
  
  const handleEditProfile = () => {
    // Navigate to a profile edit screen
    router.push('/profile/edit');
  };
  
  const handleAnalytics = () => {
    router.push('/analytics');
  };
  
  const handleSettings = () => {
    router.push('/settings');
  };
  
  const handleSyncLab = () => {
    if (hasSubscription) {
      router.push('/synclab');
    } else {
      // If not subscribed, navigate to SyncLab anyway but it will show subscription options
      router.push('/synclab');
    }
  };
  
  const handleMessages = () => {
    router.push('/messages');
  };
  
  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handleLogoPress = () => {
    router.push('/(tabs)');
  };
  
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Profile',
          headerLeft: () => (
            <TouchableOpacity onPress={handleLogoPress}>
              <Image 
                source={{ uri: freqLogoUrl }} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSettings}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} />
        
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptTitle}>Sign in to access your profile</Text>
          <Text style={styles.loginPromptText}>
            Create and share music, connect with other artists, and more
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        
        <LoginModal 
          visible={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Profile',
        headerLeft: () => (
          <TouchableOpacity onPress={handleLogoPress}>
            <Image 
              source={{ uri: freqLogoUrl }} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleAnalytics}
            >
              <BarChart size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSettings}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          currentTrack && isMinimized ? styles.contentWithMiniPlayer : null,
          currentTrack && !isMinimized ? styles.contentWithFullPlayer : null,
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: currentUser?.avatarUrl || defaultAvatarUri }} 
              style={styles.avatar}
            />
            {hasSubscription && (
              <View style={styles.subscriptionBadge}>
                <Crown size={14} color="#FFF" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{currentUser?.displayName}</Text>
            <Text style={styles.username}>@{currentUser?.username}</Text>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => router.push('/library')}
              >
                <Text style={styles.statValue}>{userTracks.length}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.statValue}>{followers?.length || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => setShowFollowingModal(true)}
              >
                <Text style={styles.statValue}>{following?.length || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
            
            {currentUser?.bio && (
              <Text style={styles.bio}>{currentUser.bio}</Text>
            )}
            
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleEditProfile}
              >
                <Edit size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleUpload}
              >
                <Upload size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>Upload</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleMessages}
              >
                <Inbox size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>Inbox</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  hasSubscription ? styles.syncLabButtonSubscribed : styles.syncLabButton
                ]}
                onPress={handleSyncLab}
              >
                <Zap size={16} color={hasSubscription ? "#FFF" : colors.text} />
                <Text style={[
                  styles.actionButtonText,
                  hasSubscription ? styles.syncLabTextSubscribed : null
                ]}>
                  SyncLab
                </Text>
                {hasSubscription && (
                  <View style={styles.syncLabPro}>
                    <Text style={styles.syncLabProText}>PRO</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* SyncLab Section - Prominently displayed for subscribers */}
        {hasSubscription && (
          <View style={styles.syncLabPromoSection}>
            <View style={styles.syncLabPromoHeader}>
              <View style={styles.syncLabPromoTitleContainer}>
                <Zap size={24} color={colors.primary} />
                <Text style={styles.syncLabPromoTitle}>SyncLab Dashboard</Text>
              </View>
              <Crown size={20} color={colors.primary} />
            </View>
            
            <Text style={styles.syncLabPromoDescription}>
              Access your professional tools, manage sync opportunities, and track your earnings
            </Text>
            
            <View style={styles.syncLabFeatures}>
              <View style={styles.syncLabFeatureItem}>
                <Star size={16} color={colors.primary} />
                <Text style={styles.syncLabFeatureText}>Sync Opportunities</Text>
              </View>
              <View style={styles.syncLabFeatureItem}>
                <BarChart size={16} color={colors.primary} />
                <Text style={styles.syncLabFeatureText}>Royalty Tracking</Text>
              </View>
              <View style={styles.syncLabFeatureItem}>
                <Music size={16} color={colors.primary} />
                <Text style={styles.syncLabFeatureText}>Catalog Management</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.syncLabDashboardButton}
              onPress={handleSyncLab}
            >
              <Text style={styles.syncLabDashboardButtonText}>Open SyncLab Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Tracks</Text>
            <TouchableOpacity onPress={handleUpload}>
              <Upload size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {userTracks.length > 0 ? (
            <View style={styles.tracksList}>
              {userTracks.slice(0, 3).map(track => (
                <View key={track.id} style={styles.trackItem}>
                  <TouchableOpacity 
                    style={styles.trackPlayButton}
                    onPress={() => handlePlayTrack(track)}
                  >
                    <Play size={16} color={colors.text} fill={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.trackItemContent}
                    onPress={() => router.push(`/track/${track.id}`)}
                  >
                    <Image 
                      source={{ uri: track.coverArt }} 
                      style={styles.trackCover}
                    />
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackStats}>
                        {Math.floor(Math.random() * 1000)} plays • {Math.floor(Math.random() * 100)} likes
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              
              {userTracks.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/library')}
                >
                  <Text style={styles.viewAllText}>View All Tracks</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Music size={32} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                You haven't uploaded any tracks yet
              </Text>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleUpload}
              >
                <Upload size={16} color={colors.text} />
                <Text style={styles.uploadButtonText}>Upload Your First Track</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liked Tracks</Text>
            <Heart size={20} color={colors.text} />
          </View>
          
          {likedTracksList.length > 0 ? (
            <View style={styles.tracksList}>
              {likedTracksList.slice(0, 3).map(track => (
                <View key={track.id} style={styles.trackItem}>
                  <TouchableOpacity 
                    style={styles.trackPlayButton}
                    onPress={() => handlePlayTrack(track)}
                  >
                    <Play size={16} color={colors.text} fill={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.trackItemContent}
                    onPress={() => router.push(`/track/${track.id}`)}
                  >
                    <Image 
                      source={{ uri: track.coverArt }} 
                      style={styles.trackCover}
                    />
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackArtist}>{track.artist}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              
              {likedTracksList.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/library')}
                >
                  <Text style={styles.viewAllText}>View All Liked Tracks</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Heart size={32} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                You haven't liked any tracks yet
              </Text>
            </View>
          )}
        </View>
        
        {/* SyncLab Section for non-subscribers */}
        {!hasSubscription && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SyncLab</Text>
              <Zap size={20} color={colors.primary} />
            </View>
            
            <View style={styles.syncLabContainer}>
              <Text style={styles.syncLabPromoText}>
                Unlock advanced audio tools and sync opportunities with SyncLab Pro
              </Text>
              <TouchableOpacity 
                style={styles.syncLabSubscribeButton}
                onPress={handleSyncLab}
              >
                <Crown size={20} color="#FFF" />
                <Text style={styles.syncLabSubscribeText}>Subscribe Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <MessageSquare size={20} color={colors.text} />
          </View>
          
          <TouchableOpacity 
            style={styles.messagesButton}
            onPress={handleMessages}
          >
            <Inbox size={24} color={colors.text} />
            <Text style={styles.messagesButtonText}>Go to Inbox</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.text} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <FollowersModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        users={followerUsers}
        title="Followers"
      />
      
      <FollowersModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        users={followingUsers}
        title="Following"
      />
      
      <UploadTrackModal 
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginHorizontal: 8,
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100, // Increased to ensure content is not hidden behind tab bar
  },
  contentWithMiniPlayer: {
    paddingBottom: 140, // Space for mini player
  },
  contentWithFullPlayer: {
    paddingBottom: 20,
  },
  profileHeader: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.cardElevated,
  },
  subscriptionBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  profileInfo: {
    alignItems: 'center',
  },
  displayName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  syncLabButton: {
    backgroundColor: colors.cardElevated,
  },
  syncLabButtonSubscribed: {
    backgroundColor: colors.primary,
    position: 'relative',
  },
  syncLabPro: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  syncLabProText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  syncLabTextSubscribed: {
    color: '#FFF',
  },
  // SyncLab Promo Section for subscribers
  syncLabPromoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  syncLabPromoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncLabPromoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncLabPromoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  syncLabPromoDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  syncLabFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  syncLabFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
  },
  syncLabFeatureText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  syncLabDashboardButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncLabDashboardButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  tracksList: {
    gap: 12,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  trackItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  trackStats: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginPromptTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  loginPromptText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4169E1', // Royal blue
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  messagesButton: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  messagesButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  syncLabContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  syncLabPromoText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  syncLabSubscribeButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  syncLabSubscribeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});