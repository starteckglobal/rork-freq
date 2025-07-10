import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image,
  StatusBar
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Search, 
  ChevronLeft,
  MessageCircle,
  UserPlus
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { users } from '@/mocks/users';
import { defaultAvatarUri, freqLogoUrl } from '@/constants/images';
import StyledInput from '@/components/StyledInput';

export default function NewMessageScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectUser = (userId: string) => {
    // In a real app, this would create a new conversation or open an existing one
    // For demo purposes, we'll just navigate to a mock conversation
    router.push(`/messages/1`);
  };
  
  const renderUserItem = ({ item }: { item: typeof users[0] }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => handleSelectUser(item.id)}
    >
      <Image 
        source={{ uri: item.avatarUrl || defaultAvatarUri }}
        style={styles.avatar}
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      
      <MessageCircle size={20} color={colors.primary} />
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ 
        title: 'New Message',
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
              onPress={() => router.push('/messages')}
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
      }} />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <StyledInput
            placeholder="Search for people"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            containerStyle={styles.styledSearchInput}

          />
        </View>
        
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.userList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UserPlus size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 
                  "No users match your search" : 
                  "Start typing to search for users"
                }
              </Text>
            </View>
          }
        />
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
  userList: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  styledSearchInput: {
    width: '100%',
  },
});