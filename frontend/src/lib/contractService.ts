// src/lib/contractService.ts
import { ethers } from "ethers";
import { CONTRACT_CONFIG } from "./contractConfig";
import type { UserProfile, Post } from "../types/contract";

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

  // --- User Management Functions ---

  /**
   * Fetches user profile data from the contract.
   * Uses the public 'users' mapping getter on the contract.
   * @param address The user's wallet address.
   * @returns A Promise resolving to the UserProfile object, or an empty object if not registered.
   */
  public async getUserProfile(address: string): Promise<UserProfile | null> {
    const contract = this.ensureContract();
    // Directly call the 'users' mapping which acts as a getter function
    const userInfo = await contract.users(address);

    // Check if the user is actually registered on the contract
    if (userInfo.isRegistered) {
      return {
        username: userInfo.username,
        profilePictureHash: userInfo.profilePictureHash,
        isRegistered: userInfo.isRegistered,
        registrationDate: Number(userInfo.registrationDate),
      };
    } else {
      // User is not registered, return null to indicate this.
      return null;
    }
  }

  /**
   * Registers a new user on the blockchain.
   * This function aligns with the 'createProfile' logic needed for sign-up.
   * It attempts to call 'createProfile' first, and falls back to 'registerUser' if 'createProfile' doesn't exist.
   * @param username The desired username for the new profile.
   * @param bio Optional bio for the user.
   * @param profileImageHash Optional hash for the user's profile picture.
   * @returns A Promise resolving to the transaction hash.
   */
  public async createProfile(
    username: string,
    bio: string = "", // Added bio parameter
    profileImageHash: string = "" // Added profileImageHash parameter
  ): Promise<void> {
    const contract = this.ensureContract();
    this.ensureSigner();

    // Try to call 'createProfile' if it exists in the contract ABI
    if (contract.createProfile) {
      const tx = await contract.createProfile(username, bio, profileImageHash);
      await tx.wait();
    }
    // Fallback: If 'createProfile' doesn't exist, use 'registerUser' (from your deployed contract)
    else if (contract.registerUser) {
      // IMPORTANT: If your 'registerUser' only takes 'username', this call will work for sign-up.
      // If you need to pass bio/profileImageHash with 'registerUser', you'll need to update the contract's 'registerUser' function as well.
      const tx = await contract.registerUser(username);
      await tx.wait();
    } else {
      throw new Error(
        "No user registration function found on the contract ('createProfile' or 'registerUser')."
      );
    }
  }

  // Add updateProfile method to match interface
  public async updateProfile(bio?: string, profileImageHash?: string): Promise<void> {
    const contract = this.ensureContract();
    this.ensureSigner();

    if (contract.updateProfile) {
      const tx = await contract.updateProfile(profileImageHash || '');
      await tx.wait();
    } else {
      throw new Error("updateProfile function not found on the contract");
    }
  }

  // --- Post Functions ---
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

  // --- Follow System Functions ---
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

  // --- Chat System Functions ---
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

  // --- Event Listeners ---
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

  // --- Cleanup ---
  public removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Singleton instance
export const contractService = new SocialMediaContractService();
