import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Search, 
  Plus, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Smile, 
  ChevronLeft,
  MoreVertical,
  Heart,
  ThumbsUp,
  Flame,
  ArrowRight,
  Phone,
  Video,
  Info,
  Paperclip,
  Gift,
  Music
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { users } from '@/mocks/users';
import { freqLogoUrl, defaultAvatarUri } from '@/constants/images';
import { useUserStore } from '@/store/user-store';

const { width } = Dimensions.get('window');

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

// Mock messages for a conversation
const MESSAGES = [
  {
    id: '1',
    senderId: '2',
    text: "Hey, I really liked your new track!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: true,
  },
  {
    id: '2',
    senderId: 'current-user',
    text: "Thanks! I appreciate that.",
    timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
    read: true,
  },
  {
    id: '3',
    senderId: '2',
    text: "The production quality is amazing. What DAW do you use?",
    timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
    read: true,
  },
  {
    id: '4',
    senderId: 'current-user',
    text: "I use Ableton Live for most of my productions. Been using it for years now.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    read: true,
  },
  {
    id: '5',
    senderId: '2',
    text: "Nice! I've been thinking about switching to Ableton. Would you recommend it for someone coming from FL Studio?",
    timestamp: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
    read: true,
  },
  {
    id: '6',
    senderId: 'current-user',
    text: "Definitely! The workflow is different but I think you'll like it. The session view is great for experimenting with ideas.",
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
    read: true,
  },
  {
    id: '7',
    senderId: '2',
    text: "Cool, I'll check it out. By the way, would you be interested in collaborating on a track?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: true,
  },
  {
    id: '8',
    senderId: 'current-user',
    text: "I'd be open to that! What kind of track did you have in mind?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    read: true,
  },
  {
    id: '9',
    senderId: '2',
    text: "I'm working on an electronic track with some vocal samples. I think your production style would fit perfectly.",
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    read: true,
  },
  {
    id: '10',
    senderId: '2',
    text: "I can send you what I have so far if you're interested.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: true,
  },
];

// Mock reactions
const REACTIONS = [
  { id: 'heart', icon: Heart, color: '#FF6B6B' },
  { id: 'thumbsup', icon: ThumbsUp, color: '#4ECDC4' },
  { id: 'flame', icon: Flame, color: '#FFD166' },
];

export default function MessengerScreen() {
  const [activeTab, setActiveTab] = useState('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [messages, setMessages] = useState(MESSAGES);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const { isLoggedIn, setShowLoginModal, currentUser } = useUserStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  
  // Check if we're coming from a profile page with a userId
  useEffect(() => {
    if (params.userId) {
      const userId = String(params.userId);
      // Find or create a conversation with this user
      const existingConvo = CONVERSATIONS.find(c => c.userId === userId);
      if (existingConvo) {
        setSelectedConversation(existingConvo.id);
      } else {
        // In a real app, we would create a new conversation here
        // For demo, we'll just select the first conversation
        if (CONVERSATIONS.length > 0) {
          setSelectedConversation(CONVERSATIONS[0].id);
        }
      }
    }
  }, [params.userId]);
  
  // Filter conversations based on search query
  const filteredConversations = CONVERSATIONS.filter(convo => {
    const user = users.find(u => u.id === convo.userId);
    if (!user) return false;
    
    return (
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Simulate typing indicator
  useEffect(() => {
    if (selectedConversation) {
      const typingTimeout = setTimeout(() => {
        setIsTyping(Math.random() > 0.7);
        
        if (isTyping) {
          const responseTimeout = setTimeout(() => {
            const newMsg = {
              id: `msg-${Date.now()}`,
              senderId: CONVERSATIONS.find(c => c.id === selectedConversation)?.userId || '2',
              text: "I'm excited to work with you on this project!",
              timestamp: new Date(),
              read: false,
            };
            
            setMessages(prev => [...prev, newMsg]);
            setIsTyping(false);
            
            // Scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }, 3000);
          
          return () => clearTimeout(responseTimeout);
        }
      }, 10000);
      
      return () => clearTimeout(typingTimeout);
    }
  }, [selectedConversation, isTyping]);
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // In a real app, you would mark messages as read here
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add new message to the list
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      text: newMessage,
      timestamp: new Date(),
      read: false,
    };
    
    setMessages(prev => [...prev, newMsg]);
    
    // Clear the input
    setNewMessage('');
    
    // Scroll to bottom of messages
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate typing indicator from the other person
    setTimeout(() => {
      setIsTyping(true);
      
      // Simulate response after typing
      setTimeout(() => {
        setIsTyping(false);
        
        const responseMsg = {
          id: `msg-${Date.now() + 1}`,
          senderId: CONVERSATIONS.find(c => c.id === selectedConversation)?.userId || '2',
          text: "That sounds great! I'll send you more details soon.",
          timestamp: new Date(),
          read: false,
        };
        
        setMessages(prev => [...prev, responseMsg]);
        
        // Scroll to bottom again
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 3000);
    }, 1500);
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
  
  const handleShowReactions = (messageId: string) => {
    setShowReactions(showReactions === messageId ? null : messageId);
  };
  
  const handleReact = (messageId: string, reactionType: string) => {
    // In a real app, you would send this reaction to the backend
    console.log(`Reacted with ${reactionType} to message ${messageId}`);
    Alert.alert("Reaction Added", `You reacted with ${reactionType}`);
    setShowReactions(null);
  };
  
  const handleAttachment = (type: string) => {
    // In a real app, this would open the appropriate picker
    Alert.alert("Attachment", `Attaching ${type}`);
    setShowAttachmentOptions(false);
  };
  
  const handleNewConversation = () => {
    // In a real app, this would open a user picker
    Alert.alert("New Conversation", "Select a user to message");
    // For demo purposes, just select the first conversation
    if (CONVERSATIONS.length > 0) {
      setSelectedConversation(CONVERSATIONS[0].id);
    }
  };
  
  const renderConversationItem = ({ item }: { item: typeof CONVERSATIONS[0] }) => {
    const user = users.find(u => u.id === item.userId);
    if (!user) return null;
    
    return (
      <TouchableOpacity 
        style={[
          styles.conversationItem,
          selectedConversation === item.id && styles.selectedConversation
        ]}
        onPress={() => handleSelectConversation(item.id)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user.avatarUrl || defaultAvatarUri }}
            style={styles.avatar}
          />
          {item.unread > 0 && (
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
              item.unread > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderMessageItem = ({ item }: { item: typeof messages[0] }) => {
    const isCurrentUser = item.senderId === 'current-user';
    const user = isCurrentUser 
      ? { displayName: 'You', avatarUrl: currentUser?.avatarUrl || '' } 
      : users.find(u => u.id === item.senderId);
    
    if (!user) return null;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Image 
            source={{ uri: user.avatarUrl || defaultAvatarUri }}
            style={styles.messageAvatar}
          />
        )}
        
        <TouchableOpacity
          onLongPress={() => handleShowReactions(item.id)}
          activeOpacity={0.8}
        >
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}>
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.messageTimestamp,
              isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
            ]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isCurrentUser && item.read && ' ✓'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {showReactions === item.id && (
          <View style={styles.reactionsContainer}>
            {REACTIONS.map(reaction => (
              <TouchableOpacity 
                key={reaction.id}
                style={styles.reactionButton}
                onPress={() => handleReact(item.id, reaction.id)}
              >
                <reaction.icon size={20} color={reaction.color} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  const renderConversationList = () => (
    <View style={styles.conversationListContainer}>
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
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
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
      
      <FlatList
        data={filteredConversations}
        keyExtractor={item => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.conversationList}
      />
      
      <TouchableOpacity 
        style={styles.newMessageButton}
        onPress={handleNewConversation}
      >
        <Plus size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
  
  const renderConversation = () => {
    const conversation = CONVERSATIONS.find(c => c.id === selectedConversation);
    if (!conversation) return null;
    
    const user = users.find(u => u.id === conversation.userId);
    if (!user) return null;
    
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.conversationContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.conversationHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/')}>
            <Image 
              source={{ uri: freqLogoUrl }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.userInfoContainer}
            onPress={() => router.push(`/profile/${user.id}`)}
          >
            <Image 
              source={{ uri: user.avatarUrl || defaultAvatarUri }}
              style={styles.headerAvatar}
            />
            <View>
              <Text style={styles.headerUsername}>{user.displayName}</Text>
              <Text style={styles.onlineStatus}>Online</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Phone size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Video size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Info size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{user.displayName} is typing...</Text>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {showAttachmentOptions && (
          <View style={styles.attachmentOptions}>
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('image')}
            >
              <View style={styles.attachmentIconContainer}>
                <ImageIcon size={24} color={colors.text} />
              </View>
              <Text style={styles.attachmentText}>Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('audio')}
            >
              <View style={styles.attachmentIconContainer}>
                <Music size={24} color={colors.text} />
              </View>
              <Text style={styles.attachmentText}>Audio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('gift')}
            >
              <View style={styles.attachmentIconContainer}>
                <Gift size={24} color={colors.text} />
              </View>
              <Text style={styles.attachmentText}>Gift</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('voice')}
            >
              <View style={styles.attachmentIconContainer}>
                <Mic size={24} color={colors.text} />
              </View>
              <Text style={styles.attachmentText}>Voice</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
          >
            <Paperclip size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          
          {newMessage.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Send size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleAttachment('voice')}
              >
                <Mic size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleAttachment('image')}
              >
                <ImageIcon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Smile size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
              <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
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
          <Text style={styles.loginPromptTitle}>Sign in to access messages</Text>
          <Text style={styles.loginPromptText}>
            Connect with artists and fans through direct messages
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ 
        title: selectedConversation ? '' : 'Messages',
        headerShown: !selectedConversation,
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
            <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
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
      
      <View style={styles.content}>
        {Platform.OS === 'web' && !selectedConversation ? (
          <View style={styles.webLayout}>
            {renderConversationList()}
            <View style={styles.noConversationSelected}>
              <Text style={styles.noConversationText}>Select a conversation to start messaging</Text>
            </View>
          </View>
        ) : selectedConversation ? (
          renderConversation()
        ) : (
          renderConversationList()
        )}
      </View>
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
  content: {
    flex: 1,
  },
  webLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationListContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && { maxWidth: 350, borderRightWidth: 1, borderRightColor: colors.border }),
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
  conversationList: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedConversation: {
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
  conversationContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && { flex: 2 }),
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerUsername: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  onlineStatus: {
    color: '#4CAF50', // Green
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: width * 0.7,
  },
  currentUserBubble: {
    backgroundColor: '#4169E1', // Royal blue
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: colors.text,
  },
  messageTimestamp: {
    alignSelf: 'flex-end',
    fontSize: 10,
    marginTop: 4,
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimestamp: {
    color: colors.textTertiary,
  },
  reactionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: -30,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reactionButton: {
    padding: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  typingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginRight: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: colors.text,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
  },
  noConversationSelected: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  noConversationText: {
    color: colors.textSecondary,
    fontSize: 16,
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
  attachmentOptions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
  },
  attachmentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4169E1', // Royal blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    color: colors.text,
    fontSize: 12,
  }
});