// src/lib/mockService.ts
import {
  mockUsers,
  mockPosts,
  mockComments,
  mockFollowRelationships,
  mockPostLikes,
  mockChats,
  mockMessages,
  getMockUserProfile,
  getMockPost,
  getMockComments,
  getMockFollowers,
  getMockFollowing,
  getMockPostLikes,
  getMockUserPosts,
  getMockChats,
  getMockMessages,
} from '../data/mockData';
import type { UserProfile, Post, ContractComment, ContractMessage, ContractChat } from '../types/contract';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock contract service that mimics the real contract service interface
export class MockContractService {
  private isInitialized = false;
  private createdProfiles?: Map<string, UserProfile>;

  // Initialization methods
  async initializeWithSigner(_signer: any): Promise<void> {
    await delay(200);
    this.isInitialized = true;
    console.log('Mock contract service initialized with signer');
  }

  async initializeWithProvider(_provider: any): Promise<void> {
    await delay(200);
    this.isInitialized = true;
    console.log('Mock contract service initialized with provider');
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      // Auto-initialize for mock service since it doesn't need real connections
      console.warn('Mock service auto-initializing...');
      this.isInitialized = true;
    }
  }

  // User Profile Functions
  async createProfile(username: string, bio: string = '', profileImageHash?: string): Promise<void> {
    this.ensureInitialized();
    await delay(1000); // Simulate transaction time

    // Create/update the mock user profile for the default account
    const defaultAccount = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8';

    // Store the created profile in a simple in-memory store for this session
    if (!this.createdProfiles) {
      this.createdProfiles = new Map();
    }

    const newProfile = {
      username: username,
      bio: bio || 'New SmartBlock user! 🚀',
      profileImageHash: profileImageHash || 'QmDefaultProfileImage',
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      isActive: true,
      isRegistered: true, // This is the key - mark as registered!
    };

    // Update or create the user profile in our session store
    this.createdProfiles.set(defaultAccount, newProfile);

    console.log('✅ Mock: Profile created for', username);
  }

  async getUserProfile(userAddress: string): Promise<UserProfile | null> {
    this.ensureInitialized();
    await delay(300);

    // Check for created profiles first

    // First check if we have a created profile for this address
    if (this.createdProfiles && this.createdProfiles.has(userAddress)) {
      const profile = this.createdProfiles.get(userAddress)!;
      return profile;
    }
    // Fallback to static mock data
    return getMockUserProfile(userAddress);
  }

  async updateProfile(bio?: string, profileImageHash?: string): Promise<void> {
    this.ensureInitialized();
    await delay(800);

    console.log('Mock: Updated profile with bio:', bio, 'image:', profileImageHash);
  }

  // Post Functions
  async createPost(content: string, ipfsHash: string = ''): Promise<void> {
    this.ensureInitialized();
    await delay(1200);

    const newPost: Post = {
      id: mockPosts.length + 1,
      author: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8', // Default mock user
      content,
      imageHash: ipfsHash,
      timestamp: Date.now(),
      likes: 0,
      isActive: true,
    };

    mockPosts.unshift(newPost); // Add to beginning
    console.log('Mock: Created post:', content);
  }

  async getPost(postId: number): Promise<Post | null> {
    this.ensureInitialized();
    await delay(200);

    return getMockPost(postId);
  }

  async getUserPosts(userAddress: string): Promise<number[]> {
    this.ensureInitialized();
    await delay(300);

    return getMockUserPosts(userAddress);
  }

  async getTotalPosts(): Promise<number> {
    this.ensureInitialized();
    await delay(100);

    return mockPosts.length;
  }

  async likePost(postId: number): Promise<void> {
    this.ensureInitialized();
    await delay(600);

    const userAddress = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    // Add user to likes if not already liked
    if (!mockPostLikes[postId]) {
      mockPostLikes[postId] = [];
    }

    if (!mockPostLikes[postId].includes(userAddress)) {
      mockPostLikes[postId].push(userAddress);

      // Update post likes count
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        post.likes = mockPostLikes[postId].length;
      }
    }

    console.log('Mock: Liked post', postId);
  }

  async unlikePost(postId: number): Promise<void> {
    this.ensureInitialized();
    await delay(500);

    const userAddress = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    if (mockPostLikes[postId]) {
      mockPostLikes[postId] = mockPostLikes[postId].filter(addr => addr !== userAddress);

      // Update post likes count
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        post.likes = mockPostLikes[postId].length;
      }
    }

    console.log('Mock: Unliked post', postId);
  }

  async getPostLikes(postId: number): Promise<string[]> {
    this.ensureInitialized();
    await delay(200);

    return getMockPostLikes(postId);
  }

  // Comment Functions
  async addComment(postId: number, commentText: string): Promise<void> {
    this.ensureInitialized();
    await delay(800);

    const newComment: ContractComment = {
      id: Date.now(), // Simple ID generation
      postId,
      author: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8', // Mock current user
      content: commentText,
      timestamp: Date.now(),
    };

    if (!mockComments[postId]) {
      mockComments[postId] = [];
    }

    mockComments[postId].push(newComment);

    console.log('Mock: Added comment to post', postId);
  }

  async getPostComments(postId: number): Promise<ContractComment[]> {
    this.ensureInitialized();
    await delay(250);

    return getMockComments(postId);
  }

  // Follow Functions
  async followUser(userToFollow: string): Promise<void> {
    this.ensureInitialized();
    await delay(700);

    const currentUser = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    // Add to following list
    if (!mockFollowRelationships.following[currentUser]) {
      mockFollowRelationships.following[currentUser] = [];
    }

    if (!mockFollowRelationships.following[currentUser].includes(userToFollow)) {
      mockFollowRelationships.following[currentUser].push(userToFollow);
    }

    // Add to followers list
    if (!mockFollowRelationships.followers[userToFollow as keyof typeof mockFollowRelationships.followers]) {
      (mockFollowRelationships.followers as any)[userToFollow] = [];
    }

    if (!mockFollowRelationships.followers[userToFollow as keyof typeof mockFollowRelationships.followers]?.includes(currentUser)) {
      mockFollowRelationships.followers[userToFollow as keyof typeof mockFollowRelationships.followers]?.push(currentUser);
    }

    // Update user profile counts
    const userProfile = mockUsers[userToFollow as keyof typeof mockUsers];
    if (userProfile) {
      userProfile.followerCount = mockFollowRelationships.followers[userToFollow as keyof typeof mockFollowRelationships.followers]?.length || 0;
    }

    const currentUserProfile = mockUsers[currentUser];
    if (currentUserProfile) {
      currentUserProfile.followingCount = mockFollowRelationships.following[currentUser].length;
    }

    console.log('Mock: Followed user', userToFollow);
  }

  async unfollowUser(userToUnfollow: string): Promise<void> {
    this.ensureInitialized();
    await delay(600);

    const currentUser = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    // Remove from following list
    if (mockFollowRelationships.following[currentUser as keyof typeof mockFollowRelationships.following]) {
      mockFollowRelationships.following[currentUser as keyof typeof mockFollowRelationships.following] =
        mockFollowRelationships.following[currentUser as keyof typeof mockFollowRelationships.following].filter((addr: string) => addr !== userToUnfollow);
    }

    // Remove from followers list
    if (mockFollowRelationships.followers[userToUnfollow as keyof typeof mockFollowRelationships.followers]) {
      mockFollowRelationships.followers[userToUnfollow as keyof typeof mockFollowRelationships.followers] =
        mockFollowRelationships.followers[userToUnfollow as keyof typeof mockFollowRelationships.followers].filter((addr: string) => addr !== currentUser);
    }

    // Update user profile counts
    const userProfile = mockUsers[userToUnfollow as keyof typeof mockUsers];
    if (userProfile) {
      userProfile.followerCount = mockFollowRelationships.followers[userToUnfollow as keyof typeof mockFollowRelationships.followers]?.length || 0;
    }

    const currentUserProfile = mockUsers[currentUser];
    if (currentUserProfile) {
      currentUserProfile.followingCount = mockFollowRelationships.following[currentUser]?.length || 0;
    }

    console.log('Mock: Unfollowed user', userToUnfollow);
  }

  async getFollowers(userAddress: string): Promise<string[]> {
    this.ensureInitialized();
    await delay(200);

    return getMockFollowers(userAddress);
  }

  async getFollowing(userAddress: string): Promise<string[]> {
    this.ensureInitialized();
    await delay(200);

    return getMockFollowing(userAddress);
  }

  // Chat Functions
  async createChat(participant: string): Promise<void> {
    this.ensureInitialized();
    await delay(800);

    const currentUser = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    const newChat: ContractChat = {
      id: (mockChats.length + 1).toString(),
      participants: [currentUser, participant],
      messageCount: 0,
      lastMessageTimestamp: Date.now(),
    };

    mockChats.push(newChat);

    console.log('Mock: Created chat with', participant);
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    this.ensureInitialized();
    await delay(600);

    const currentUser = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    const newMessage: ContractMessage = {
      id: Date.now(),
      chatId,
      sender: currentUser,
      content,
      timestamp: Date.now(),
      isRead: false,
    };

    if (!mockMessages[chatId]) {
      mockMessages[chatId] = [];
    }

    mockMessages[chatId].push(newMessage);

    // Update chat info
    const chat = mockChats.find(c => c.id === chatId);
    if (chat) {
      chat.messageCount = mockMessages[chatId].length;
      chat.lastMessageTimestamp = Date.now();
    }

    console.log('Mock: Sent message to chat', chatId);
  }

  async getUserChats(userAddress: string): Promise<ContractChat[]> {
    this.ensureInitialized();
    await delay(300);

    return getMockChats(userAddress);
  }

  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<ContractMessage[]> {
    this.ensureInitialized();
    await delay(200);

    const messages = getMockMessages(chatId);
    return messages.slice(offset, offset + limit);
  }

  async getChatWithUser(userAddress: string): Promise<string | null> {
    this.ensureInitialized();
    await delay(200);

    const currentUser = '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8'; // Mock current user

    const chat = mockChats.find(c =>
      c.participants.includes(currentUser) && c.participants.includes(userAddress)
    );

    return chat?.id || null;
  }

  // Utility Functions
  async isUserRegistered(userAddress: string): Promise<boolean> {
    this.ensureInitialized();
    await delay(100);

    const profile = getMockUserProfile(userAddress);
    return profile?.isActive || false;
  }

  async getAllPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
    this.ensureInitialized();
    await delay(400);

    return mockPosts.slice(offset, offset + limit);
  }

  async getRecentPosts(limit: number = 20): Promise<Post[]> {
    this.ensureInitialized();
    await delay(300);

    return mockPosts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getFeedPosts(userAddress: string, limit: number = 20): Promise<Post[]> {
    this.ensureInitialized();
    await delay(400);

    const following = getMockFollowing(userAddress);
    const feedPosts = mockPosts.filter(post =>
      following.includes(post.author) || post.author === userAddress
    );

    return feedPosts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    this.ensureInitialized();
    await delay(300);
    
    return Object.values(mockUsers);
  }
}

// Create and export singleton instance
export const mockContractService = new MockContractService();