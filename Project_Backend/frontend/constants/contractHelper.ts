import { ethers } from 'ethers';
import { SocialMediaPlatform } from '../../typechain-types';

// Contract ABI and address will be imported from the generated files
import deploymentInfo from './deployment.json';
import contractABI from './abi.json';

export interface ContractConfig {
  address: string;
  abi: any[];
  network: string;
  chainId: number;
}

export class SocialMediaContractHelper {
  private contract: SocialMediaPlatform | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.loadContractConfig();
  }

  private loadContractConfig(): ContractConfig {
    return deploymentInfo as ContractConfig;
  }

  // Connect to the contract with a provider (read-only)
  async connectReadOnly(rpcUrl?: string): Promise<SocialMediaPlatform> {
    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    } else if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      throw new Error('No provider available. Please provide an RPC URL or connect a wallet.');
    }

    this.contract = new ethers.Contract(
      deploymentInfo.contractAddress,
      contractABI,
      this.provider
    ) as SocialMediaPlatform;

    return this.contract;
  }

  // Connect to the contract with a signer (read-write)
  async connectWithWallet(): Promise<SocialMediaPlatform> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    this.contract = new ethers.Contract(
      deploymentInfo.contractAddress,
      contractABI,
      this.signer
    ) as SocialMediaPlatform;

    return this.contract;
  }

  // Get contract instance (must be connected first)
  getContract(): SocialMediaPlatform {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectReadOnly() or connectWithWallet() first.');
    }
    return this.contract;
  }

  // Get current network info
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    return await this.provider.getNetwork();
  }

  // Check if user is registered
  async isUserRegistered(address: string): Promise<boolean> {
    const contract = this.getContract();
    const user = await contract.users(address);
    return user.isRegistered;
  }

  // Get user info
  async getUserInfo(address: string) {
    const contract = this.getContract();
    return await contract.users(address);
  }

  // Get post by ID
  async getPost(postId: number) {
    const contract = this.getContract();
    return await contract.getPost(postId);
  }

  // Get total number of posts
  async getTotalPosts(): Promise<number> {
    const contract = this.getContract();
    return Number(await contract.getTotalPosts());
  }

  // Get user's posts
  async getUserPosts(address: string): Promise<number[]> {
    const contract = this.getContract();
    const posts = await contract.getUserPosts(address);
    return posts.map(p => Number(p));
  }

  // Get post comments
  async getPostComments(postId: number) {
    const contract = this.getContract();
    return await contract.getPostComments(postId);
  }

  // Get post likes
  async getPostLikes(postId: number): Promise<string[]> {
    const contract = this.getContract();
    return await contract.getPostLikes(postId);
  }

  // Get user's followers
  async getFollowers(address: string): Promise<string[]> {
    const contract = this.getContract();
    return await contract.getFollowers(address);
  }

  // Get users that a user is following
  async getFollowing(address: string): Promise<string[]> {
    const contract = this.getContract();
    return await contract.getFollowing(address);
  }

  // Get user's chats
  async getUserChats(): Promise<number[]> {
    const contract = this.getContract();
    const chats = await contract.getUserChats();
    return chats.map(c => Number(c));
  }

  // Get chat messages
  async getChatMessages(chatId: number, limit: number = 50, offset: number = 0) {
    const contract = this.getContract();
    return await contract.getChatMessages(chatId, limit, offset);
  }

  // Get chat with specific user
  async getChatWithUser(userAddress: string): Promise<number> {
    const contract = this.getContract();
    return Number(await contract.getChatWithUser(userAddress));
  }
}

// Example usage functions for React components

// Example: Read function - Get all posts
export async function getAllPosts(helper: SocialMediaContractHelper) {
  try {
    const totalPosts = await helper.getTotalPosts();
    const posts = [];
    
    for (let i = 0; i < totalPosts; i++) {
      const post = await helper.getPost(i);
      posts.push({
        id: i,
        author: post.author,
        content: post.content,
        ipfsHash: post.ipfsHash,
        timestamp: Number(post.timestamp),
        likeCount: Number(post.likeCount),
        commentCount: Number(post.commentCount),
        shareCount: Number(post.shareCount),
      });
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Example: Write function - Create a post
export async function createPost(
  helper: SocialMediaContractHelper,
  content: string,
  ipfsHash: string = ""
) {
  try {
    const contract = helper.getContract();
    const tx = await contract.createPost(content, ipfsHash);
    await tx.wait();
    
    console.log('Post created successfully:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Example: Write function - Like a post
export async function likePost(helper: SocialMediaContractHelper, postId: number) {
  try {
    const contract = helper.getContract();
    const tx = await contract.likePost(postId);
    await tx.wait();
    
    console.log('Post liked successfully:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

// Example: Write function - Register user
export async function registerUser(helper: SocialMediaContractHelper, username: string) {
  try {
    const contract = helper.getContract();
    const tx = await contract.registerUser(username);
    await tx.wait();
    
    console.log('User registered successfully:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Example: Write function - Follow user
export async function followUser(helper: SocialMediaContractHelper, userAddress: string) {
  try {
    const contract = helper.getContract();
    const tx = await contract.followUser(userAddress);
    await tx.wait();
    
    console.log('User followed successfully:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

// Example: Write function - Send message
export async function sendMessage(
  helper: SocialMediaContractHelper,
  chatId: number,
  content: string
) {
  try {
    const contract = helper.getContract();
    const tx = await contract.sendMessage(chatId, content);
    await tx.wait();
    
    console.log('Message sent successfully:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// React hook example (for use in React components)
export function useSocialMediaContract() {
  const [helper] = useState(() => new SocialMediaContractHelper());
  const [contract, setContract] = useState<SocialMediaPlatform | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const contractInstance = await helper.connectWithWallet();
      setContract(contractInstance);
      setIsConnected(true);
      return contractInstance;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const connectReadOnly = async (rpcUrl?: string) => {
    try {
      const contractInstance = await helper.connectReadOnly(rpcUrl);
      setContract(contractInstance);
      setIsConnected(true);
      return contractInstance;
    } catch (error) {
      console.error('Failed to connect read-only:', error);
      throw error;
    }
  };

  return {
    helper,
    contract,
    isConnected,
    connectWallet,
    connectReadOnly,
  };
}

// Import useState for the React hook
import { useState } from 'react';
