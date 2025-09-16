// src/lib/contractService.ts
import { ethers } from "ethers";
import { CONTRACT_CONFIG } from "./contractConfig";

// Updated UserProfile interface to match the Solidity struct
export interface UserProfile {
  username: string;
  profilePictureHash: string;
  isRegistered: boolean;
  registrationDate: number;
}

export interface ContractPost {
  author: string;
  content: string;
  ipfsHash: string;
  timestamp: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface ContractComment {
  commenter: string;
  commentText: string;
  timestamp: number;
}

export interface ContractChat {
  participant1: string;
  participant2: string;
  lastActivity: number;
}

export interface ContractMessage {
  sender: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export class SocialMediaContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!CONTRACT_CONFIG.address) {
      throw new Error(
        "Contract address not configured. Please set VITE_CONTRACT_ADDRESS environment variable."
      );
    }

    if (!ethers.isAddress(CONTRACT_CONFIG.address)) {
      throw new Error(`Invalid contract address: ${CONTRACT_CONFIG.address}`);
    }
  }

  // Initialize with provider (read-only)
  public initializeWithProvider(provider: ethers.Provider): void {
    this.provider = provider;
    this.signer = null;
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      provider
    );
  }

  // Initialize with signer (read-write)
  public initializeWithSigner(signer: ethers.Signer): void {
    this.signer = signer;
    this.provider = signer.provider;
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      signer
    );
  }

  private ensureContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error(
        "Contract not initialized. Call initializeWithProvider or initializeWithSigner first."
      );
    }
    return this.contract;
  }

  private ensureSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error(
        "Signer not available. This operation requires a wallet connection."
      );
    }
    return this.signer;
  }

  // User Management Functions
  // *** IMPORTANT CHANGE HERE ***
  // Renamed getUserProfile to call the Solidity mapping 'users' directly
  public async getUserProfile(address: string): Promise<UserProfile> {
    const contract = this.ensureContract();
    // Directly call the 'users' mapping which returns the User struct
    const userInfo = await contract.users(address);
    return {
      username: userInfo.username,
      profilePictureHash: userInfo.profilePictureHash,
      isRegistered: userInfo.isRegistered,
      registrationDate: Number(userInfo.registrationDate),
    };
  }

  // Renamed registerUser to createProfile to match UserContext.tsx
  public async createProfile(
    username: string,
    bio: string = "", // Added bio parameter to match UserContext
    profileImageHash: string = "" // Added profileImageHash parameter
  ): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    // Ensure the contract has a 'createProfile' function. If not, use 'registerUser'
    // This is a fallback in case your deployed contract only has 'registerUser' and not 'createProfile'
    if (contract.createProfile) {
      const tx = await contract.createProfile(username, bio, profileImageHash);
      await tx.wait();
      return tx.hash;
    } else if (contract.registerUser) {
      // If 'createProfile' doesn't exist, try 'registerUser' (from your older code)
      // NOTE: You might need to adjust parameters if 'registerUser' doesn't take bio/profileImageHash
      const tx = await contract.registerUser(username); // Assuming registerUser only takes username
      await tx.wait();
      return tx.hash;
    } else {
      throw new Error(
        "Neither 'createProfile' nor 'registerUser' function found on the contract."
      );
    }
  }

  // Post Functions
  public async getPost(postId: number): Promise<ContractPost> {
    const contract = this.ensureContract();
    const post = await contract.getPost(postId);
    return {
      author: post.author,
      content: post.content,
      ipfsHash: post.ipfsHash,
      timestamp: Number(post.timestamp),
      likeCount: Number(post.likeCount),
      commentCount: Number(post.commentCount),
      shareCount: Number(post.shareCount),
    };
  }

  public async createPost(
    content: string,
    ipfsHash: string = ""
  ): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.createPost(content, ipfsHash);
    await tx.wait();
    return tx.hash;
  }

  public async likePost(postId: number): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.likePost(postId);
    await tx.wait();
    return tx.hash;
  }

  public async unlikePost(postId: number): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.unlikePost(postId);
    await tx.wait();
    return tx.hash;
  }

  public async sharePost(postId: number): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.sharePost(postId);
    await tx.wait();
    return tx.hash;
  }

  public async addComment(
    postId: number,
    commentText: string
  ): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.addComment(postId, commentText);
    await tx.wait();
    return tx.hash;
  }

  public async getPostComments(postId: number): Promise<ContractComment[]> {
    const contract = this.ensureContract();
    const comments = await contract.getPostComments(postId);
    return comments.map((comment: any) => ({
      commenter: comment.commenter,
      commentText: comment.commentText,
      timestamp: Number(comment.timestamp),
    }));
  }

  public async getPostLikes(postId: number): Promise<string[]> {
    const contract = this.ensureContract();
    return await contract.getPostLikes(postId);
  }

  public async getUserPosts(address: string): Promise<number[]> {
    const contract = this.ensureContract();
    const posts = await contract.getUserPosts(address);
    return posts.map((postId: any) => Number(postId));
  }

  public async getTotalPosts(): Promise<number> {
    const contract = this.ensureContract();
    return Number(await contract.getTotalPosts());
  }

  // Follow System Functions
  public async followUser(userAddress: string): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.followUser(userAddress);
    await tx.wait();
    return tx.hash;
  }

  public async unfollowUser(userAddress: string): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.unfollowUser(userAddress);
    await tx.wait();
    return tx.hash;
  }

  public async getFollowers(address: string): Promise<string[]> {
    const contract = this.ensureContract();
    return await contract.getFollowers(address);
  }

  public async getFollowing(address: string): Promise<string[]> {
    const contract = this.ensureContract();
    return await contract.getFollowing(address);
  }

  // Chat System Functions
  public async createChat(participantAddress: string): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.createChat(participantAddress);
    await tx.wait();
    return tx.hash;
  }

  public async sendMessage(chatId: number, content: string): Promise<string> {
    const contract = this.ensureContract();
    this.ensureSigner();

    const tx = await contract.sendMessage(chatId, content);
    await tx.wait();
    return tx.hash;
  }

  public async getChat(chatId: number): Promise<ContractChat> {
    const contract = this.ensureContract();
    const chat = await contract.getChat(chatId);
    return {
      participant1: chat.participant1,
      participant2: chat.participant2,
      lastActivity: Number(chat.lastActivity),
    };
  }

  public async getChatMessages(
    chatId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ContractMessage[]> {
    const contract = this.ensureContract();
    const messages = await contract.getChatMessages(chatId, limit, offset);
    return messages.map((message: any) => ({
      sender: message.sender,
      content: message.content,
      timestamp: Number(message.timestamp),
      read: message.read,
    }));
  }

  public async getUserChats(): Promise<number[]> {
    const contract = this.ensureContract();
    const chats = await contract.getUserChats();
    return chats.map((chatId: any) => Number(chatId));
  }

  public async getChatWithUser(userAddress: string): Promise<number> {
    const contract = this.ensureContract();
    return Number(await contract.getChatWithUser(userAddress));
  }

  // Event Listeners
  public onUserRegistered(
    callback: (user: string, username: string) => void
  ): void {
    const contract = this.ensureContract();
    contract.on("UserRegistered", callback);
  }

  public onPostCreated(
    callback: (
      postId: number,
      author: string,
      content: string,
      ipfsHash: string
    ) => void
  ): void {
    const contract = this.ensureContract();
    contract.on("PostCreated", (postId, author, content, ipfsHash) => {
      callback(Number(postId), author, content, ipfsHash);
    });
  }

  public onPostLiked(callback: (postId: number, liker: string) => void): void {
    const contract = this.ensureContract();
    contract.on("PostLiked", (postId, liker) => {
      callback(Number(postId), liker);
    });
  }

  public onUserFollowed(
    callback: (follower: string, followed: string) => void
  ): void {
    const contract = this.ensureContract();
    contract.on("UserFollowed", callback);
  }

  public onChatCreated(
    callback: (
      chatId: number,
      participant1: string,
      participant2: string
    ) => void
  ): void {
    const contract = this.ensureContract();
    contract.on("ChatCreated", (chatId, participant1, participant2) => {
      callback(Number(chatId), participant1, participant2);
    });
  }

  public onMessageSent(
    callback: (chatId: number, sender: string, content: string) => void
  ): void {
    const contract = this.ensureContract();
    contract.on("MessageSent", (chatId, sender, content) => {
      callback(Number(chatId), sender, content);
    });
  }

  // Cleanup
  public removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Singleton instance
export const contractService = new SocialMediaContractService();
