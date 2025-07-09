import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  MessageCircle,
  Bell
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { users } from '@/mocks/users';
import { freqLogoUrl, defaultAvatarUri } from '@/constants/images';
import { useUserStore } from '@/store/user-store';
import LoginModal from '@/components/LoginModal';

// Mock conversation data
const CONVERSATIONS = [
  {
    id: '1',
    userId: '2',
    lastMessage: "Hey, I really liked your new track!",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unread: 2,
  },
  {
    id: '2',
    userId: '3',
    lastMessage: "Would you be interested in a collaboration?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: 0,
  },
  {
    id: '3',
    userId: '4',
    lastMessage: "Thanks for the feedback on my latest release",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: 0,
  },
  {
    id: '4',
    userId: '5',
    lastMessage: "I shared your track with my followers",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    unread: 0,
  },
  {
    id: '5',
    userId: '6',
    lastMessage: "Let's work on that remix soon",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    unread: 1,
  },
  {
    id: '6',
    userId: '7',
    lastMessage: "Check out this new plugin I found",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    unread: 0,
  }
];

// Mock message requests
const MESSAGE_REQUESTS = [
  {
    id: '7',
    userId: '8',
    lastMessage: "Hi, I'm a producer looking to work with vocalists",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    unread: 1,
  },
  {
    id: '8',
    userId: '9',
    lastMessage: "Your music is amazing! Would love to connect",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    unread: 1,
  }
];

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoggedIn, setShowLoginModal, showLoginModal } = useUserStore();
  const [hasNotifications, setHasNotifications] = useState(true);
  const router = useRouter();
  
  // Filter conversations based on search query and active tab
  const getFilteredConversations = () => {
    let conversationsToFilter = 
      activeTab === 'primary' ? CONVERSATIONS :
      activeTab === 'requests' ? MESSAGE_REQUESTS :
      []; // Archive would be empty for now
    
    return conversationsToFilter.filter(convo => {
      const user = users.find(u => u.id === convo.userId);
      if (!user) return false;
      
      return (
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };
  
  const filteredConversations = getFilteredConversations();
  
  const handleSelectConversation = (conversationId: string) => {
    // Mark as read when opening
    if (activeTab === 'primary') {
      const conversation = CONVERSATIONS.find(c => c.id === conversationId);
      if (conversation && conversation.unread > 0) {
        conversation.unread = 0;
        // In a real app, this would update the server
      }
    }
    
    router.push(`/messages/${conversationId}`);
  };
  
  const handleNewConversation = () => {
    // In a real app, this would open a user picker
    router.push('/messages/new');
  };
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const getTotalUnreadCount = () => {
    return CONVERSATIONS.reduce((total, convo) => total + convo.unread, 0);
  };
  
  const renderConversationItem = ({ item }: { item: typeof CONVERSATIONS[0] }) => {
    const user = users.find(u => u.id === item.userId);
    if (!user) return null;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => handleSelectConversation(item.id)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user.avatarUrl || defaultAvatarUri }}
            style={styles.avatar}
          />
          {'unread' in item && item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.username}>{user.displayName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <Text 
            style={[
              styles.lastMessage,
              'unread' in item && item.unread > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Messages',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Image 
                  source={{ uri: freqLogoUrl }} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ),
        }} />
        
        <View style={styles.loginPrompt}>
          <MessageCircle size={60} color={colors.textSecondary} />
          <Text style={styles.loginPromptTitle}>Sign in to access messages</Text>
          <Text style={styles.loginPromptText}>
            Connect with artists and fans through direct messages
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={styles.loginButtonText}>Login+</Text>
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
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ 
        title: 'Messages',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
        headerLeft: () => (
          <View style={styles.headerLeftContainer}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Image 
                source={{ uri: freqLogoUrl }} 
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setHasNotifications(false)}
            >
              <Bell size={24} color={colors.text} />
              {hasNotifications && (
                <View style={styles.notificationBadge} />
              )}
            </TouchableOpacity>
          </View>
        ),
      }} />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'primary' && styles.activeTab]}
            onPress={() => setActiveTab('primary')}
          >
            <Text style={[styles.tabText, activeTab === 'primary' && styles.activeTabText]}>
              Primary
            </Text>
            {getTotalUnreadCount() > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{getTotalUnreadCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Requests
            </Text>
            {MESSAGE_REQUESTS.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{MESSAGE_REQUESTS.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'archive' && styles.activeTab]}
            onPress={() => setActiveTab('archive')}
          >
            <Text style={[styles.tabText, activeTab === 'archive' && styles.activeTabText]}>
              Archive
            </Text>
          </TouchableOpacity>
        </View>
        
        {filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={item => item.id}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.conversationList}
          />
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 
                "No conversations match your search" : 
                activeTab === 'primary' ? "No conversations yet" :
                activeTab === 'requests' ? "No message requests" :
                "No archived messages"
              }
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.newMessageButton}
          onPress={handleNewConversation}
        >
          <Plus size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <LoginModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: 8,
    padding: 8,
  },
  logo: {
    width: 32,
    height: 32,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationList: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '500',
  },
  newMessageButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    marginTop: 16,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});