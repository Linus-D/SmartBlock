// src/data/mockData.ts
import type { UserProfile, Post, ContractComment, ContractMessage, ContractChat } from '../types/contract';

// Mock users
export const mockUsers: Record<string, UserProfile> = {
  '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8': {
    username: 'alice_wonderland',
    bio: 'Exploring the blockchain rabbit hole 🐰',
    profileImageHash: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
    postCount: 15,
    followerCount: 342,
    followingCount: 89,
    isActive: true,
  },
  '0x123e4567e89b12d3a456426614174000': {
    username: 'bob_builder',
    bio: 'Building the future with smart contracts 🔨',
    profileImageHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    postCount: 23,
    followerCount: 156,
    followingCount: 201,
    isActive: true,
  },
  '0x456789abcdef123456789abcdef123456789ab': {
    username: 'charlie_crypto',
    bio: 'DeFi enthusiast and blockchain developer',
    profileImageHash: 'QmNRCQWfgze6AbqhPQn6XEn8YTRYd1VqFNpTx4qYqPFUaJ',
    postCount: 8,
    followerCount: 67,
    followingCount: 134,
    isActive: true,
  },
  '0x789abcdef123456789abcdef123456789abcdef': {
    username: 'diana_dev',
    bio: 'Full-stack developer diving into Web3 🌐',
    profileImageHash: 'QmPKCJDC7xt5hS6n8e3XF3j2YQn8YTRYd1VqFNpTx4qyP',
    postCount: 31,
    followerCount: 289,
    followingCount: 76,
    isActive: true,
  },
  '0xabcdef123456789abcdef123456789abcdef12': {
    username: 'eve_explorer',
    bio: 'Exploring NFTs and the metaverse 🎨',
    profileImageHash: 'QmXHkSzGv2YQnpMK3QdCKzD7VqTxPn4XnR8YtUwVx9AcG',
    postCount: 19,
    followerCount: 445,
    followingCount: 123,
    isActive: true,
  },
};

// Mock posts
export const mockPosts: Post[] = [
  {
    id: 1,
    author: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
    content: 'Just deployed my first smart contract! The future of Web3 is looking bright 🚀',
    imageHash: 'QmVKzJKV2Y8FtXjfgFqPnWq2j7VnwYfNwPz4K8qX2YnPG',
    timestamp: Date.now() - 3600000, // 1 hour ago
    likes: 42,
    isActive: true,
  },
  {
    id: 2,
    author: '0x123e4567e89b12d3a456426614174000',
    content: 'Working on a new DeFi protocol. Can\'t wait to share it with the community! What features would you like to see?',
    imageHash: '',
    timestamp: Date.now() - 7200000, // 2 hours ago
    likes: 28,
    isActive: true,
  },
  {
    id: 3,
    author: '0x456789abcdef123456789abcdef123456789ab',
    content: 'The gas fees are finally reasonable again! Time to mint some NFTs 🎨',
    imageHash: 'QmYKzJKV2Y8FtXjfgFqPnWq2j7VnwYfNwPz4K8qX2YnPH',
    timestamp: Date.now() - 10800000, // 3 hours ago
    likes: 15,
    isActive: true,
  },
  {
    id: 4,
    author: '0x789abcdef123456789abcdef123456789abcdef',
    content: 'Learning Solidity has been an amazing journey. The documentation is getting better every day!',
    imageHash: '',
    timestamp: Date.now() - 14400000, // 4 hours ago
    likes: 67,
    isActive: true,
  },
  {
    id: 5,
    author: '0xabcdef123456789abcdef123456789abcdef12',
    content: 'Just bought my first ENS domain! Web3 identity is so important for the future of the internet.',
    imageHash: 'QmNRCQWfgze6AbqhPQn6XEn8YTRYd1VqFNpTx4qYqPFUA',
    timestamp: Date.now() - 18000000, // 5 hours ago
    likes: 89,
    isActive: true,
  },
  {
    id: 6,
    author: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
    content: 'GM Web3 builders! What are you working on today?',
    imageHash: '',
    timestamp: Date.now() - 21600000, // 6 hours ago
    likes: 156,
    isActive: true,
  },
  {
    id: 7,
    author: '0x123e4567e89b12d3a456426614174000',
    content: 'The Ethereum merge was a historic moment. Proof of Stake is the future! ⚡',
    imageHash: 'QmPKCJDC7xt5hS6n8e3XF3j2YQn8YTRYd1VqFNpTx4qyQ',
    timestamp: Date.now() - 25200000, // 7 hours ago
    likes: 234,
    isActive: true,
  },
  {
    id: 8,
    author: '0x456789abcdef123456789abcdef123456789ab',
    content: 'Building in public is scary but so rewarding. The Web3 community is amazing! 💪',
    imageHash: '',
    timestamp: Date.now() - 28800000, // 8 hours ago
    likes: 91,
    isActive: true,
  },
];

// Mock comments
export const mockComments: Record<number, ContractComment[]> = {
  1: [
    {
      id: 1,
      postId: 1,
      author: '0x123e4567e89b12d3a456426614174000',
      content: 'Congratulations! What kind of contract did you deploy?',
      timestamp: Date.now() - 3000000,
    },
    {
      id: 2,
      postId: 1,
      author: '0x456789abcdef123456789abcdef123456789ab',
      content: 'That\'s awesome! The Web3 space needs more builders like you.',
      timestamp: Date.now() - 2700000,
    },
  ],
  2: [
    {
      id: 3,
      postId: 2,
      author: '0x789abcdef123456789abcdef123456789abcdef',
      content: 'I\'d love to see better governance mechanisms!',
      timestamp: Date.now() - 6900000,
    },
  ],
  4: [
    {
      id: 4,
      postId: 4,
      author: '0xabcdef123456789abcdef123456789abcdef12',
      content: 'The docs have definitely improved! Which resources did you find most helpful?',
      timestamp: Date.now() - 14100000,
    },
    {
      id: 5,
      postId: 4,
      author: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      content: 'Solidity by Example was a game changer for me!',
      timestamp: Date.now() - 13800000,
    },
  ],
};

// Mock chats
export const mockChats: ContractChat[] = [
  {
    id: '1',
    participants: ['0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8', '0x123e4567e89b12d3a456426614174000'],
    messageCount: 5,
    lastMessageTimestamp: Date.now() - 1800000, // 30 minutes ago
  },
  {
    id: '2',
    participants: ['0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8', '0x456789abcdef123456789abcdef123456789ab'],
    messageCount: 12,
    lastMessageTimestamp: Date.now() - 5400000, // 90 minutes ago
  },
];

// Mock messages
export const mockMessages: Record<string, ContractMessage[]> = {
  '1': [
    {
      id: 1,
      chatId: '1',
      sender: '0x123e4567e89b12d3a456426614174000',
      content: 'Hey! Saw your post about the smart contract deployment. Congrats!',
      timestamp: Date.now() - 3600000,
      isRead: true,
    },
    {
      id: 2,
      chatId: '1',
      sender: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      content: 'Thanks! It was quite a journey getting it right.',
      timestamp: Date.now() - 3300000,
      isRead: true,
    },
    {
      id: 3,
      chatId: '1',
      sender: '0x123e4567e89b12d3a456426614174000',
      content: 'I bet! What tools did you use for testing?',
      timestamp: Date.now() - 2700000,
      isRead: true,
    },
    {
      id: 4,
      chatId: '1',
      sender: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      content: 'Hardhat and Foundry. Both are amazing for different use cases.',
      timestamp: Date.now() - 2400000,
      isRead: true,
    },
    {
      id: 5,
      chatId: '1',
      sender: '0x123e4567e89b12d3a456426614174000',
      content: 'Cool! Would love to collaborate on something soon.',
      timestamp: Date.now() - 1800000,
      isRead: false,
    },
  ],
  '2': [
    {
      id: 6,
      chatId: '2',
      sender: '0x456789abcdef123456789abcdef123456789ab',
      content: 'The NFT space is evolving so fast!',
      timestamp: Date.now() - 7200000,
      isRead: true,
    },
    {
      id: 7,
      chatId: '2',
      sender: '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      content: 'Totally agree! Have you checked out the new marketplaces?',
      timestamp: Date.now() - 6900000,
      isRead: true,
    },
  ],
};

// Mock follow relationships
export const mockFollowRelationships = {
  followers: {
    '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8': [
      '0x123e4567e89b12d3a456426614174000',
      '0x456789abcdef123456789abcdef123456789ab',
      '0x789abcdef123456789abcdef123456789abcdef',
    ],
    '0x123e4567e89b12d3a456426614174000': [
      '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      '0xabcdef123456789abcdef123456789abcdef12',
    ],
    '0x456789abcdef123456789abcdef123456789ab': [
      '0x789abcdef123456789abcdef123456789abcdef',
    ],
  },
  following: {
    '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8': [
      '0x123e4567e89b12d3a456426614174000',
      '0xabcdef123456789abcdef123456789abcdef12',
    ],
    '0x123e4567e89b12d3a456426614174000': [
      '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      '0x456789abcdef123456789abcdef123456789ab',
      '0x789abcdef123456789abcdef123456789abcdef',
    ],
    '0x456789abcdef123456789abcdef123456789ab': [
      '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
    ],
    '0x789abcdef123456789abcdef123456789abcdef': [
      '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
      '0x456789abcdef123456789abcdef123456789ab',
    ],
    '0xabcdef123456789abcdef123456789abcdef12': [
      '0x123e4567e89b12d3a456426614174000',
    ],
  },
};

// Mock post likes
export const mockPostLikes: Record<number, string[]> = {
  1: [
    '0x123e4567e89b12d3a456426614174000',
    '0x456789abcdef123456789abcdef123456789ab',
    '0x789abcdef123456789abcdef123456789abcdef',
  ],
  2: [
    '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
    '0xabcdef123456789abcdef123456789abcdef12',
  ],
  3: [
    '0x123e4567e89b12d3a456426614174000',
  ],
  4: [
    '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
    '0x456789abcdef123456789abcdef123456789ab',
    '0xabcdef123456789abcdef123456789abcdef12',
  ],
  5: [
    '0x123e4567e89b12d3a456426614174000',
    '0x789abcdef123456789abcdef123456789abcdef',
  ],
  6: [
    '0x456789abcdef123456789abcdef123456789ab',
    '0x789abcdef123456789abcdef123456789abcdef',
    '0xabcdef123456789abcdef123456789abcdef12',
  ],
  7: [
    '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8',
    '0x456789abcdef123456789abcdef123456789ab',
    '0x789abcdef123456789abcdef123456789abcdef',
    '0xabcdef123456789abcdef123456789abcdef12',
  ],
  8: [
    '0x123e4567e89b12d3a456426614174000',
    '0x789abcdef123456789abcdef123456789abcdef',
  ],
};

// Mock user posts mapping
export const mockUserPosts: Record<string, number[]> = {
  '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8': [1, 6],
  '0x123e4567e89b12d3a456426614174000': [2, 7],
  '0x456789abcdef123456789abcdef123456789ab': [3, 8],
  '0x789abcdef123456789abcdef123456789abcdef': [4],
  '0xabcdef123456789abcdef123456789abcdef12': [5],
};

// Helper functions for mock data
export const getRandomUsers = (count: number = 5): UserProfile[] => {
  const userAddresses = Object.keys(mockUsers);
  const randomAddresses = userAddresses.sort(() => 0.5 - Math.random()).slice(0, count);
  return randomAddresses.map(address => mockUsers[address]);
};

export const getRandomPosts = (count: number = 10): Post[] => {
  return mockPosts.slice(0, count);
};

export const getMockUserProfile = (address: string): UserProfile | null => {
  return mockUsers[address] || null;
};

export const getMockPost = (postId: number): Post | null => {
  return mockPosts.find(post => post.id === postId) || null;
};

export const getMockComments = (postId: number): ContractComment[] => {
  return mockComments[postId] || [];
};

export const getMockFollowers = (address: string): string[] => {
  return mockFollowRelationships.followers[address] || [];
};

export const getMockFollowing = (address: string): string[] => {
  return mockFollowRelationships.following[address] || [];
};

export const getMockPostLikes = (postId: number): string[] => {
  return mockPostLikes[postId] || [];
};

export const getMockUserPosts = (address: string): number[] => {
  return mockUserPosts[address] || [];
};

export const getMockChats = (userAddress: string): ContractChat[] => {
  return mockChats.filter(chat => chat.participants.includes(userAddress));
};

export const getMockMessages = (chatId: string): ContractMessage[] => {
  return mockMessages[chatId] || [];
};