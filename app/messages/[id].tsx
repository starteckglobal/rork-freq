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
  StatusBar
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Smile, 
  ChevronLeft,
  Phone,
  Video,
  Info,
  Paperclip,
  Gift,
  Music,
  Heart,
  ThumbsUp,
  Flame,
  X
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { users } from '@/mocks/users';
import { defaultAvatarUri, freqLogoUrl } from '@/constants/images';
import { useUserStore } from '@/store/user-store';
import * as ImagePicker from 'expo-image-picker';
import EmojiSelector from '@/components/EmojiSelector';

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

// Mock conversations
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

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [messages, setMessages] = useState(MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const conversationId = id ? String(id) : '';
  
  // Handle both conversation IDs and user-based conversation IDs
  let conversation = CONVERSATIONS.find(c => c.id === conversationId);
  
  // If no conversation found and it's a user-based ID, create a mock conversation
  if (!conversation && conversationId.startsWith('conv-')) {
    const userId = conversationId.replace('conv-', '');
    conversation = {
      id: conversationId,
      userId: userId,
      lastMessage: "Start a conversation",
      timestamp: new Date(),
      unread: 0,
    };
  }
  
  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Conversation not found',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const user = users.find(u => u.id === conversation!.userId);
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'User not found',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Simulate typing indicator
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setIsTyping(Math.random() > 0.7);
      
      if (isTyping) {
        const responseTimeout = setTimeout(() => {
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: user.id,
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
  }, [isTyping, user.id]);
  
  // Scroll to bottom when component mounts
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
  }, []);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;
    
    // Add new message to the list
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      text: newMessage,
      image: selectedImage,
      timestamp: new Date(),
      read: false,
    };
    
    setMessages(prev => [...prev, newMsg]);
    
    // Clear the input and selected image
    setNewMessage('');
    setSelectedImage(null);
    
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
          senderId: user.id,
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
  
  const handleShowReactions = (messageId: string) => {
    setShowReactions(showReactions === messageId ? null : messageId);
  };
  
  const handleReact = (messageId: string, reactionType: string) => {
    // In a real app, you would send this reaction to the backend
    console.log(`Reacted with ${reactionType} to message ${messageId}`);
    Alert.alert("Reaction Added", `You reacted with ${reactionType}`);
    setShowReactions(null);
  };
  
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access your photos");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAttachmentOptions(false);
    }
  };
  
  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access your camera");
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAttachmentOptions(false);
    }
  };
  
  const handleAttachment = (type: string) => {
    switch (type) {
      case 'photo':
        handlePickImage();
        break;
      case 'camera':
        handleTakePhoto();
        break;
      case 'audio':
        Alert.alert("Audio", "Audio attachment coming soon");
        setShowAttachmentOptions(false);
        break;
      case 'gift':
        Alert.alert("Gift", "Gift attachment coming soon");
        setShowAttachmentOptions(false);
        break;
      default:
        setShowAttachmentOptions(false);
    }
  };
  
  const handleAddEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };
  
  const renderMessageItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === 'current-user';
    const messageUser = isCurrentUser 
      ? { displayName: 'You', avatarUrl: currentUser?.avatarUrl || '' } 
      : users.find(u => u.id === item.senderId);
    
    if (!messageUser) return null;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Image 
            source={{ uri: messageUser.avatarUrl || defaultAvatarUri }}
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
            {item.image && (
              <Image 
                source={{ uri: item.image }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}
            
            {item.text && (
              <Text style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText
              ]}>
                {item.text}
              </Text>
            )}
            
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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ 
        headerTitle: () => (
          <TouchableOpacity 
            style={styles.headerTitleContainer}
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
        ),
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
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
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Phone size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Video size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Info size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ),
      }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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
        
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image 
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
        
        {showAttachmentOptions && (
          <View style={styles.attachmentOptions}>
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('photo')}
            >
              <View style={styles.attachmentIconContainer}>
                <ImageIcon size={24} color={colors.text} />
              </View>
              <Text style={styles.attachmentText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('camera')}
            >
              <View style={styles.attachmentIconContainer}>
                <Video size={24} color={colors.text} />
              </View>
              <Text style={styles.attachmentText}>Camera</Text>
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
          </View>
        )}
        
        {showEmojiPicker && (
          <EmojiSelector onEmojiSelected={handleAddEmoji} />
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {
              setShowAttachmentOptions(!showAttachmentOptions);
              setShowEmojiPicker(false);
            }}
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
            onFocus={() => {
              setShowAttachmentOptions(false);
              setShowEmojiPicker(false);
            }}
          />
          
          {newMessage.trim() || selectedImage ? (
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
                onPress={() => Alert.alert("Voice Message", "Voice message recording coming soon")}
              >
                <Mic size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachmentOptions(false);
                }}
              >
                <Smile size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerUsername: {
    color: '#FFFFFF',
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
    maxWidth: 300,
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
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
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
  },
  selectedImageContainer: {
    margin: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});