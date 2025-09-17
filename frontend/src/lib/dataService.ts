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
}

// Configuration for data mode
export enum DataMode {
  MOCK = 'mock',
  REAL = 'real',
  AUTO = 'auto', // Use mock if contract not available, otherwise real
}

// Data service manager that switches between mock and real data
class DataServiceManager implements IDataService {
  private currentMode: DataMode = DataMode.AUTO;
  private useMock: boolean = false;

  constructor() {
    this.initializeMode();
  }

  private initializeMode(): void {
    // Check environment variables and development flags
    const envMode = import.meta.env.VITE_DATA_MODE as DataMode;
    const isDevelopment = import.meta.env.DEV;
    const hasContractAddress = !!import.meta.env.VITE_CONTRACT_ADDRESS;
    const isLocalNetwork = import.meta.env.VITE_CHAIN_ID === '31337' || import.meta.env.VITE_CHAIN_ID === '1337';

    // Set mode based on configuration
    if (envMode) {
      this.currentMode = envMode;
    } else if (isDevelopment && !hasContractAddress) {
      this.currentMode = DataMode.MOCK;
    } else if (isDevelopment && isLocalNetwork) {
      this.currentMode = DataMode.AUTO;
    } else {
      this.currentMode = DataMode.REAL;
    }

    this.updateUseMock();
    console.log(`DataService initialized in ${this.currentMode} mode (using ${this.useMock ? 'mock' : 'real'} data)`);
  }

  private updateUseMock(): void {
    switch (this.currentMode) {
      case DataMode.MOCK:
        this.useMock = true;
        break;
      case DataMode.REAL:
        this.useMock = false;
        break;
      case DataMode.AUTO:
        // Auto mode logic: use mock if contract service is not available or in development
        this.useMock = import.meta.env.DEV && !this.isContractServiceAvailable();
        break;
    }
  }

  private isContractServiceAvailable(): boolean {
    // Check if contract service is properly configured
    try {
      const hasAddress = !!import.meta.env.VITE_CONTRACT_ADDRESS;
      const hasValidChain = !!import.meta.env.VITE_CHAIN_ID;
      return hasAddress && hasValidChain;
    } catch {
      return false;
    }
  }

  private getService(): IDataService {
    return this.useMock ? mockContractService : contractService;
  }

  // Public method to switch modes (useful for development/testing)
  public setMode(mode: DataMode): void {
    this.currentMode = mode;
    this.updateUseMock();
    console.log(`DataService switched to ${mode} mode (using ${this.useMock ? 'mock' : 'real'} data)`);
  }

  public getCurrentMode(): { mode: DataMode; usingMock: boolean } {
    return {
      mode: this.currentMode,
      usingMock: this.useMock,
    };
  }

  // Force refresh of mode detection (useful when wallet connects)
  public refreshMode(): void {
    if (this.currentMode === DataMode.AUTO) {
      this.updateUseMock();
    }
  }

  // Initialization methods
  async initializeWithSigner(signer: any): Promise<void> {
    try {
      await this.getService().initializeWithSigner(signer);
      // If we're in auto mode and real service works, switch to real
      if (this.currentMode === DataMode.AUTO && this.useMock) {
        this.useMock = false;
        console.log('DataService: Switched to real data after successful wallet connection');
      }
    } catch (error) {
      // If real service fails and we're in auto mode, fall back to mock
      if (this.currentMode === DataMode.AUTO && !this.useMock) {
        console.warn('DataService: Real service failed, falling back to mock data');
        this.useMock = true;
        await mockContractService.initializeWithSigner(signer);
      } else if (this.useMock) {
        // If we're already using mock service and it fails, try to initialize it again
        await mockContractService.initializeWithSigner(signer);
      } else {
        throw error;
      }
    }
  }

  async initializeWithProvider(provider: any): Promise<void> {
    try {
      await this.getService().initializeWithProvider(provider);
      // If we're in auto mode and real service works, switch to real
      if (this.currentMode === DataMode.AUTO && this.useMock) {
        this.useMock = false;
        console.log('DataService: Switched to real data after successful provider connection');
      }
    } catch (error) {
      // If real service fails and we're in auto mode, fall back to mock
      if (this.currentMode === DataMode.AUTO && !this.useMock) {
        console.warn('DataService: Real service failed, falling back to mock data');
        this.useMock = true;
        await mockContractService.initializeWithProvider(provider);
      } else if (this.useMock) {
        // If we're already using mock service and it fails, try to initialize it again
        await mockContractService.initializeWithProvider(provider);
      } else {
        throw error;
      }
    }
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
}

// Create and export singleton instance
export const dataService = new DataServiceManager();

// Export types for use in components
export type { IDataService };