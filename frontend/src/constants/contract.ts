import type { ContractConfig, NetworkConfig } from "../types/contract";

// Import from your backend deployment files
import deploymentData from "../../../Project_Backend/frontend/constants/deployment.json";
import contractAddresses from "../../../Project_Backend/frontend/constants/contractAddress.json";

// Network configurations
export const NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/",
    blockExplorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
    },
  },
  1337: {
    chainId: 1337,
    name: "Local Hardhat",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorerUrl: "http://localhost:8545",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Get contract configuration based on environment
export function getContractConfig(): ContractConfig {
  const chainId = parseInt(import.meta.env.VITE_CHAIN_ID || "11155111");
  const customAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  // Use custom address if provided in env, otherwise use from deployment files
  let contractAddress: string;

  if (customAddress) {
    contractAddress = customAddress;
  } else {
    // Try to get from contractAddresses.json based on chainId
    const addressKey = chainId.toString() as keyof typeof contractAddresses;
    contractAddress = contractAddresses[addressKey] || "";

    // Fallback to deployment.json if available
    if (!contractAddress && deploymentData?.address) {
      contractAddress = deploymentData.address;
    }
  }

  if (!contractAddress) {
    throw new Error(`No contract address found for chain ID ${chainId}`);
  }

  const network = NETWORKS[chainId];
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return {
    address: contractAddress,
    chainId,
    blockExplorerUrl: network.blockExplorerUrl,
    // Add start block from deployment if available
    startBlock: deploymentData?.blockNumber || undefined,
  };
}

// Export the default config
export const CONTRACT_CONFIG = getContractConfig();

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = Object.keys(NETWORKS).map(Number);

// Default chain ID
export const DEFAULT_CHAIN_ID = parseInt(
  import.meta.env.VITE_CHAIN_ID || "11155111"
);

// RPC URLs
export const RPC_URLS: Record<number, string> = {
  1: import.meta.env.VITE_MAINNET_RPC || "https://mainnet.infura.io/v3/",
  11155111: import.meta.env.VITE_SEPOLIA_RPC || "https://sepolia.infura.io/v3/",
  1337: "http://127.0.0.1:8545",
};

// Block explorer URLs for transactions
export const getBlockExplorerUrl = (
  chainId: number,
  txHash: string
): string => {
  const network = NETWORKS[chainId];
  return network ? `${network.blockExplorerUrl}/tx/${txHash}` : "";
};

// Block explorer URLs for addresses
export const getAddressExplorerUrl = (
  chainId: number,
  address: string
): string => {
  const network = NETWORKS[chainId];
  return network ? `${network.blockExplorerUrl}/address/${address}` : "";
};

// Check if chain is supported
export const isSupportedChain = (chainId: number): boolean => {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
};

// Get network name
export const getNetworkName = (chainId: number): string => {
  return NETWORKS[chainId]?.name || `Unknown Network (${chainId})`;
};

// Contract interaction limits
export const CONTRACT_LIMITS = {
  MAX_POST_LENGTH: 280,
  MAX_BIO_LENGTH: 160,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_POSTS_PER_REQUEST: 50,
  MAX_USERS_PER_REQUEST: 100,
  MAX_MEDIA_PER_POST: 4,
  PAGINATION_LIMIT: 20,
};

// Gas limits for common operations (estimated)
export const GAS_LIMITS = {
  REGISTER_USER: 150000,
  UPDATE_PROFILE: 100000,
  CREATE_POST: 200000,
  LIKE_POST: 80000,
  UNLIKE_POST: 60000,
  FOLLOW_USER: 100000,
  UNFOLLOW_USER: 80000,
  CREATE_COMMENT: 150000,
};

// Event filter topics for listening to contract events
export const EVENT_TOPICS = {
  POST_CREATED: "0x...", // This would be the actual topic hash
  USER_REGISTERED: "0x...",
  FOLLOW: "0x...",
  UNFOLLOW: "0x...",
  POST_LIKED: "0x...",
  POST_UNLIKED: "0x...",
  COMMENT_CREATED: "0x...",
};

// Error messages
export const CONTRACT_ERRORS = {
  WALLET_NOT_CONNECTED: "Please connect your wallet to continue",
  WRONG_NETWORK: "Please switch to the correct network",
  CONTRACT_NOT_INITIALIZED: "Contract is not initialized",
  USER_NOT_REGISTERED: "User is not registered",
  INSUFFICIENT_GAS: "Insufficient gas for transaction",
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
  POST_NOT_FOUND: "Post not found",
  USER_NOT_FOUND: "User not found",
  ALREADY_FOLLOWING: "Already following this user",
  NOT_FOLLOWING: "Not following this user",
  ALREADY_LIKED: "Already liked this post",
  NOT_LIKED: "Post not liked",
  INVALID_INPUT: "Invalid input parameters",
};

// IPFS configuration
export const IPFS_CONFIG = {
  GATEWAY: import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/",
  PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY || "",
  PINATA_SECRET: import.meta.env.VITE_PINATA_SECRET_KEY || "",
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  SUPPORTED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
};
