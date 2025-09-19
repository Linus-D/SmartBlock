// src/types/contract.ts
export interface ContractPost {
  id: number;
  author: string;
  content: string;
  ipfsHash: string;
  timestamp: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ContractUser {
  username: string;
  profilePictureHash: string;
  isRegistered: boolean;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface ContractComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  timestamp: number;
}

export interface ContractMessage {
  id: number;
  chatId: string;
  sender: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface ContractChat {
  id: string;
  participants: string[];
  messageCount: number;
  lastMessageTimestamp: number;
}
// frontend/src/types/contract.ts
export interface Post {
  id: number;
  author: string;
  content: string;
  imageHash: string;
  timestamp: number;
  likes: number;
  isActive: boolean;
}

export interface UserProfile {
  username: string;
  bio: string;
  profileImageHash: string;
  profilePictureHash?: string; // Legacy compatibility
  postCount: number;
  followerCount: number;
  followingCount: number;
  isActive: boolean;
  isRegistered: boolean;
  registrationDate?: number;
}

export interface ContractError {
  message: string;
  code?: string;
}

export interface ContractConfig {
  address: string;
  chainId: number;
  blockExplorerUrl: string;
  startBlock?: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
