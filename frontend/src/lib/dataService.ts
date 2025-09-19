// src/lib/dataService.ts
import { mockContractService } from './mockService';
import { contractService } from './contractService';
import type { UserProfile, Post, ContractComment, ContractMessage, ContractChat } from '../types/contract';

// Data service interface that both mock and real services must implement
interface IDataService {
  // Initialization
  initializeWithSigner(signer: any): Promise<void>;
  initializeWithProvider(provider: any): Promise<void>;

  // User Profile Functions
  createProfile(username: string, bio?: string, profileImageHash?: string): Promise<void>;
  getUserProfile(userAddress: string): Promise<UserProfile | null>;
  updateProfile(bio?: string, profileImageHash?: string): Promise<void>;

  // Post Functions
  createPost(content: string, ipfsHash?: string): Promise<void>;
  getPost(postId: number): Promise<Post | null>;
  getUserPosts(userAddress: string): Promise<number[]>;
  getTotalPosts(): Promise<number>;
  likePost(postId: number): Promise<void>;
  unlikePost(postId: number): Promise<void>;
  getPostLikes(postId: number): Promise<string[]>;

  // Comment Functions
  addComment(postId: number, commentText: string): Promise<void>;
  getPostComments(postId: number): Promise<ContractComment[]>;

  // Follow Functions
  followUser(userToFollow: string): Promise<void>;
  unfollowUser(userToUnfollow: string): Promise<void>;
  getFollowers(userAddress: string): Promise<string[]>;
  getFollowing(userAddress: string): Promise<string[]>;

  // Chat Functions (if implemented)
  createChat?(participant: string): Promise<void>;
  sendMessage?(chatId: string, content: string): Promise<void>;
  getUserChats?(userAddress: string): Promise<ContractChat[]>;
  getChatMessages?(chatId: string, limit?: number, offset?: number): Promise<ContractMessage[]>;
  getChatWithUser?(userAddress: string): Promise<string | null>;

  // Utility Functions
  isUserRegistered?(userAddress: string): Promise<boolean>;
  getAllPosts?(limit?: number, offset?: number): Promise<Post[]>;
  getRecentPosts?(limit?: number): Promise<Post[]>;
  getFeedPosts?(userAddress: string, limit?: number): Promise<Post[]>;
  getAllUsers?(): Promise<UserProfile[]>;
}

// Configuration for data mode
export const DataMode = {
  MOCK: 'mock',
  REAL: 'real',
} as const;

export type DataMode = typeof DataMode[keyof typeof DataMode];

// Simplified data service manager
class DataServiceManager implements IDataService {
  private useMock: boolean;

  constructor() {
    // Simple mode detection based on environment
    const envMode = import.meta.env.VITE_DATA_MODE as DataMode;
    const isDevelopment = import.meta.env.DEV;
    const hasContractAddress = !!import.meta.env.VITE_CONTRACT_ADDRESS;

    // Use mock if explicitly set to mock, or if in development without contract address
    this.useMock = envMode === DataMode.MOCK || (isDevelopment && !hasContractAddress);
    
    console.log(`DataService initialized using ${this.useMock ? 'mock' : 'real'} data`);
  }

  private getService(): IDataService {
    if (this.useMock) {
      return mockContractService;
    }
    
    // Create a wrapper for contractService to match IDataService interface
    return {
      initializeWithSigner: async (signer: any) => contractService.initializeWithSigner(signer),
      initializeWithProvider: async (provider: any) => contractService.initializeWithProvider(provider),
      createProfile: async (username: string, bio?: string, profileImageHash?: string) => 
        contractService.createProfile(username, bio, profileImageHash),
      getUserProfile: async (userAddress: string) => contractService.getUserProfile(userAddress),
      updateProfile: async () => { /* Not implemented in contractService */ },
      createPost: async () => { /* Not implemented in contractService */ },
      getPost: async () => null,
      getUserPosts: async () => [],
      getTotalPosts: async () => 0,
      likePost: async () => { /* Not implemented in contractService */ },
      unlikePost: async () => { /* Not implemented in contractService */ },
      getPostLikes: async () => [],
      addComment: async () => { /* Not implemented in contractService */ },
      getPostComments: async () => [],
      followUser: async () => { /* Not implemented in contractService */ },
      unfollowUser: async () => { /* Not implemented in contractService */ },
      getFollowers: async () => [],
      getFollowing: async () => [],
    };
  }

  // Public method to switch modes (useful for development/testing)
  public setMode(mode: DataMode): void {
    this.useMock = mode === DataMode.MOCK;
    console.log(`DataService switched to ${mode} mode`);
  }

  public getCurrentMode(): { mode: DataMode; usingMock: boolean } {
    return {
      mode: this.useMock ? DataMode.MOCK : DataMode.REAL,
      usingMock: this.useMock,
    };
  }

  // Initialization methods
  async initializeWithSigner(signer: any): Promise<void> {
    return this.getService().initializeWithSigner(signer);
  }

  async initializeWithProvider(provider: any): Promise<void> {
    // If no provider is passed (dev mode), always use mock
    if (!provider && import.meta.env.DEV) {
      this.useMock = true;
      return mockContractService.initializeWithProvider(null);
    }
    
    return this.getService().initializeWithProvider(provider);
  }

  // User Profile Functions
  async createProfile(username: string, bio: string = '', profileImageHash?: string): Promise<void> {
    return this.getService().createProfile(username, bio, profileImageHash);
  }

  async getUserProfile(userAddress: string): Promise<UserProfile | null> {
    return this.getService().getUserProfile(userAddress);
  }

  async updateProfile(bio?: string, profileImageHash?: string): Promise<void> {
    return this.getService().updateProfile(bio, profileImageHash);
  }

  // Post Functions
  async createPost(content: string, ipfsHash: string = ''): Promise<void> {
    return this.getService().createPost(content, ipfsHash);
  }

  async getPost(postId: number): Promise<Post | null> {
    return this.getService().getPost(postId);
  }

  async getUserPosts(userAddress: string): Promise<number[]> {
    return this.getService().getUserPosts(userAddress);
  }

  async getTotalPosts(): Promise<number> {
    return this.getService().getTotalPosts();
  }

  async likePost(postId: number): Promise<void> {
    return this.getService().likePost(postId);
  }

  async unlikePost(postId: number): Promise<void> {
    if (this.getService().unlikePost) {
      return this.getService().unlikePost!(postId);
    }
    throw new Error('Unlike post not implemented in current service');
  }

  async getPostLikes(postId: number): Promise<string[]> {
    if (this.getService().getPostLikes) {
      return this.getService().getPostLikes!(postId);
    }
    return [];
  }

  // Comment Functions
  async addComment(postId: number, commentText: string): Promise<void> {
    if (this.getService().addComment) {
      return this.getService().addComment!(postId, commentText);
    }
    throw new Error('Comments not implemented in current service');
  }

  async getPostComments(postId: number): Promise<ContractComment[]> {
    if (this.getService().getPostComments) {
      return this.getService().getPostComments!(postId);
    }
    return [];
  }

  // Follow Functions
  async followUser(userToFollow: string): Promise<void> {
    return this.getService().followUser(userToFollow);
  }

  async unfollowUser(userToUnfollow: string): Promise<void> {
    return this.getService().unfollowUser(userToUnfollow);
  }

  async getFollowers(userAddress: string): Promise<string[]> {
    return this.getService().getFollowers(userAddress);
  }

  async getFollowing(userAddress: string): Promise<string[]> {
    return this.getService().getFollowing(userAddress);
  }

  // Chat Functions
  async createChat(participant: string): Promise<void> {
    if (this.getService().createChat) {
      return this.getService().createChat!(participant);
    }
    throw new Error('Chat not implemented in current service');
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    if (this.getService().sendMessage) {
      return this.getService().sendMessage!(chatId, content);
    }
    throw new Error('Messaging not implemented in current service');
  }

  async getUserChats(userAddress: string): Promise<ContractChat[]> {
    if (this.getService().getUserChats) {
      return this.getService().getUserChats!(userAddress);
    }
    return [];
  }

  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<ContractMessage[]> {
    if (this.getService().getChatMessages) {
      return this.getService().getChatMessages!(chatId, limit, offset);
    }
    return [];
  }

  async getChatWithUser(userAddress: string): Promise<string | null> {
    if (this.getService().getChatWithUser) {
      return this.getService().getChatWithUser!(userAddress);
    }
    return null;
  }

  // Utility Functions
  async isUserRegistered(userAddress: string): Promise<boolean> {
    if (this.getService().isUserRegistered) {
      return this.getService().isUserRegistered!(userAddress);
    }
    const profile = await this.getUserProfile(userAddress);
    return profile?.isActive || false;
  }

  async getAllPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
    if (this.getService().getAllPosts) {
      return this.getService().getAllPosts!(limit, offset);
    }
    // Fallback: get recent posts if getAllPosts not available
    return this.getRecentPosts(limit);
  }

  async getRecentPosts(limit: number = 20): Promise<Post[]> {
    if (this.getService().getRecentPosts) {
      return this.getService().getRecentPosts!(limit);
    }
    // Fallback: get all posts and sort by timestamp
    const allPosts = await this.getAllPosts(limit);
    return allPosts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  async getFeedPosts(userAddress: string, limit: number = 20): Promise<Post[]> {
    if (this.getService().getFeedPosts) {
      return this.getService().getFeedPosts!(userAddress, limit);
    }
    // Fallback: get recent posts
    return this.getRecentPosts(limit);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (this.getService().getAllUsers) {
      return this.getService().getAllUsers!();
    }
    // Fallback: return empty array if not implemented
    return [];
  }
}

// Create and export singleton instance
export const dataService = new DataServiceManager();

// Export types for use in components
export type { IDataService };