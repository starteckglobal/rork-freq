import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Users, Search, UserX, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { defaultAvatarUri } from '@/constants/images';
import StyledButton from '@/components/StyledButton';

// Mock blocked users data
const mockBlockedUsers = [
  {
    id: '1',
    username: 'spammer123',
    displayName: 'Spam Account',
    avatarUrl: defaultAvatarUri,
    blockedDate: '2024-01-15',
  },
  {
    id: '2',
    username: 'trolluser',
    displayName: 'Troll User',
    avatarUrl: defaultAvatarUri,
    blockedDate: '2024-01-10',
  },
];

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [newBlockUsername, setNewBlockUsername] = useState('');

  const handleUnblockUser = (userId: string, username: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock @${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            setBlockedUsers(prev => prev.filter(user => user.id !== userId));
            Alert.alert('Success', `@${username} has been unblocked`);
          },
        },
      ]
    );
  };

  const handleBlockNewUser = () => {
    if (!newBlockUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    // Check if user is already blocked
    const isAlreadyBlocked = blockedUsers.some(
      user => user.username.toLowerCase() === newBlockUsername.toLowerCase()
    );

    if (isAlreadyBlocked) {
      Alert.alert('Error', 'This user is already blocked');
      return;
    }

    Alert.alert(
      'Block User',
      `Are you sure you want to block @${newBlockUsername}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            const newBlockedUser = {
              id: Date.now().toString(),
              username: newBlockUsername.toLowerCase(),
              displayName: newBlockUsername,
              avatarUrl: defaultAvatarUri,
              blockedDate: new Date().toISOString().split('T')[0],
            };
            
            setBlockedUsers(prev => [newBlockedUser, ...prev]);
            setNewBlockUsername('');
            Alert.alert('Success', `@${newBlockUsername} has been blocked`);
          },
        },
      ]
    );
  };

  const filteredUsers = blockedUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BlockedUserItem = ({ user }: { user: typeof mockBlockedUsers[0] }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.blockedDate}>Blocked on {user.blockedDate}</Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockUser(user.id, user.username)}
      >
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Blocked Users',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Block New User Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Block a User</Text>
          <Text style={styles.sectionDescription}>
            Enter a username to block them from interacting with you
          </Text>
          
          <View style={styles.blockInputContainer}>
            <TextInput
              style={styles.blockInput}
              placeholder="Enter username (without @)"
              placeholderTextColor={colors.textSecondary}
              value={newBlockUsername}
              onChangeText={setNewBlockUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.blockButton}
              onPress={handleBlockNewUser}
            >
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        {blockedUsers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.searchContainer}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search blocked users..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        {/* Blocked Users List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              Blocked Users ({blockedUsers.length})
            </Text>
          </View>

          {filteredUsers.length > 0 ? (
            <View style={styles.usersList}>
              {filteredUsers.map(user => (
                <BlockedUserItem key={user.id} user={user} />
              ))}
            </View>
          ) : blockedUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <UserX size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Blocked Users</Text>
              <Text style={styles.emptyStateText}>
                You haven't blocked any users yet. Blocked users won't be able to follow you, 
                message you, or interact with your content.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Search size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Results</Text>
              <Text style={styles.emptyStateText}>
                No blocked users match your search query.
              </Text>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Blocking</Text>
          <Text style={styles.infoText}>
            When you block someone:
          </Text>
          <Text style={styles.infoItem}>• They can't follow you or see your profile</Text>
          <Text style={styles.infoItem}>• They can't message you</Text>
          <Text style={styles.infoItem}>• They can't comment on your tracks</Text>
          <Text style={styles.infoItem}>• They won't be notified that you blocked them</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  blockInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blockInput: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  blockButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
    fontSize: 16,
  },
  usersList: {
    gap: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
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
    marginBottom: 2,
  },
  username: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  blockedDate: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  unblockButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unblockButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  infoItem: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
});