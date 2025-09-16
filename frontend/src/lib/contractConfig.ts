// src/lib/contractConfig.ts
import { ethers } from "ethers";

// Import contract artifacts from the backend
const CONTRACT_ABI = [
  // User Management
  "function users(address) external view returns (string username, string profilePictureHash, bool isRegistered, uint256 registrationDate)",
  "function registerUser(string memory username) external",
  "function updateProfile(string memory profilePictureHash) external",

  // Posts
  "function posts(uint256) external view returns (address author, string content, string ipfsHash, uint256 timestamp, uint256 likeCount, uint256 commentCount, uint256 shareCount)",
  "function createPost(string memory content, string memory ipfsHash) external",
  "function likePost(uint256 postId) external",
  "function unlikePost(uint256 postId) external",
  "function sharePost(uint256 postId) external",
  "function addComment(uint256 postId, string memory commentText) external",
  "function getPost(uint256 postId) external view returns (tuple(address author, string content, string ipfsHash, uint256 timestamp, uint256 likeCount, uint256 commentCount, uint256 shareCount))",
  "function getPostComments(uint256 postId) external view returns (tuple(address commenter, string commentText, uint256 timestamp)[])",
  "function getPostLikes(uint256 postId) external view returns (address[])",
  "function getUserPosts(address user) external view returns (uint256[])",
  "function getTotalPosts() external view returns (uint256)",

  // Follow System
  "function followUser(address userToFollow) external",
  "function unfollowUser(address userToUnfollow) external",
  "function getFollowers(address user) external view returns (address[])",
  "function getFollowing(address user) external view returns (address[])",

  // Chat System
  "function createChat(address participant) external",
  "function sendMessage(uint256 chatId, string memory content) external",
  "function getChat(uint256 chatId) external view returns (tuple(address participant1, address participant2, uint256 lastActivity))",
  "function getChatMessages(uint256 chatId, uint256 limit, uint256 offset) external view returns (tuple(address sender, string content, uint256 timestamp, bool read)[])",
  "function getUserChats() external view returns (uint256[])",
  "function getChatWithUser(address user) external view returns (uint256)",

  // Events
  "event UserRegistered(address indexed user, string username)",
  "event PostCreated(uint256 indexed postId, address indexed author, string content, string ipfsHash)",
  "event PostLiked(uint256 indexed postId, address indexed liker)",
  "event UserFollowed(address indexed follower, address indexed followed)",
  "event ChatCreated(uint256 indexed chatId, address indexed participant1, address indexed participant2)",
  "event MessageSent(uint256 indexed chatId, address indexed sender, string content)",
];

// Network configurations
export const NETWORK_CONFIG = {
  31337: {
    name: "Hardhat",
    rpcUrl: "http://localhost:8545",
    chainId: 31337,
    blockExplorer: "",
  },
  11155111: {
    name: "Sepolia",
    rpcUrl:
      import.meta.env.VITE_SEPOLIA_RPC_URL ||
      "https://eth-sepolia.g.alchemy.com/v2/q_kkRez73ri5phr4duHN0",
    chainId: 11155111,
    blockExplorer: "https://sepolia.etherscan.io",
  },
};

// Contract configuration
export const CONTRACT_CONFIG = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS || "",
  abi: CONTRACT_ABI,
  supportedChainIds: [31337, 11155111],
};

// Contract interface for type checking
export const CONTRACT_INTERFACE = new ethers.Interface(CONTRACT_ABI);

// Helper functions
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const isSupportedNetwork = (chainId: number): boolean => {
  return CONTRACT_CONFIG.supportedChainIds.includes(chainId);
};

export const getNetworkName = (chainId: number): string => {
  return (
    NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.name || "Unknown"
  );
};

export const getRpcUrl = (chainId: number): string => {
  return NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.rpcUrl || "";
};
