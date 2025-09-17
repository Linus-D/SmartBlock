// src/hooks/useContract.ts
import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { dataService, DataMode } from "../lib/dataService";
import type {
  UserProfile,
  Post,
  ContractComment,
  ContractMessage,
  ContractChat
} from "../types/contract";
import { isSupportedNetwork } from "../lib/contractConfig";

export const useContract = () => {
  const { provider, signer, account, chainId, isConnected } = useWeb3();
  const [isContractReady, setIsContractReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize data service when wallet is connected
  useEffect(() => {
    const initializeDataService = async () => {
      if (isConnected && provider && chainId) {
        if (!isSupportedNetwork(chainId)) {
          setError(`Unsupported network. Please switch to a supported network.`);
          setIsContractReady(false);
          return;
        }

        try {
          if (signer) {
            await dataService.initializeWithSigner(signer);
          } else {
            await dataService.initializeWithProvider(provider);
          }
          setIsContractReady(true);
          setError(null);

          // Log current data mode for debugging
          const mode = dataService.getCurrentMode();
          console.log(`Data service initialized: ${mode.mode} mode, using ${mode.usingMock ? 'mock' : 'real'} data`);
        } catch (err: any) {
          setError(`Failed to initialize data service: ${err.message}`);
          setIsContractReady(false);
        }
      } else {
        // In development mode, initialize with mock data even without wallet
        if (import.meta.env.DEV) {
          try {
            await dataService.initializeWithProvider(null);
            setIsContractReady(true);
            setError(null);
          } catch (err: any) {
            console.warn('Failed to initialize mock data service:', err.message);
          }
        } else {
          setIsContractReady(false);
          if (!isConnected) {
            setError(null); // Clear error when disconnected
          }
        }
      }
    };

    initializeDataService();
  }, [isConnected, provider, signer, chainId]);

  // Generic transaction wrapper
  const executeTransaction = useCallback(
    async <T>(
      transactionFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: string) => void
    ): Promise<{
      success: boolean;
      data?: T;
      error?: string;
    }> => {
      if (!isContractReady) {
        const error = "Contract not initialized";
        onError?.(error);
        return { success: false, error };
      }

      if (!account) {
        const error = "Wallet not connected";
        onError?.(error);
        return { success: false, error };
      }

      setLoading(true);
      try {
        const result = await transactionFn();
        onSuccess?.(result);
        return { success: true, data: result };
      } catch (err: any) {
        const error = err.message || "Transaction failed";
        onError?.(error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [isContractReady, account]
  );

  // User Functions
  const createProfile = useCallback(
    async (username: string, bio: string = "", profileImageHash?: string) => {
      return executeTransaction(() =>
        dataService.createProfile(username, bio, profileImageHash)
      );
    },
    [executeTransaction]
  );

  const getUserProfile = useCallback(
    async (userAddress: string): Promise<UserProfile | null> => {
      // In dev mode, allow profile retrieval even if contract not ready (for mock data)
      if (!isContractReady && !import.meta.env.DEV) {
        console.log('⚠️ Contract not ready, returning null');
        return null;
      }

      try {
        console.log('🔄 Getting user profile from dataService for:', userAddress);
        const profile = await dataService.getUserProfile(userAddress);
        console.log('📊 DataService returned profile:', profile);
        return profile;
      } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
      }
    },
    [isContractReady]
  );

  // Post Functions
  const createPost = useCallback(
    async (content: string, ipfsHash: string = "") => {
      return executeTransaction(() =>
        dataService.createPost(content, ipfsHash)
      );
    },
    [executeTransaction]
  );

  const getPost = useCallback(
    async (postId: number): Promise<Post | null> => {
      if (!isContractReady) return null;

      try {
        return await dataService.getPost(postId);
      } catch (error) {
        console.error("Error getting post:", error);
        return null;
      }
    },
    [isContractReady]
  );

  const likePost = useCallback(
    async (postId: number) => {
      return executeTransaction(() => dataService.likePost(postId));
    },
    [executeTransaction]
  );

  const getUserPosts = useCallback(
    async (userAddress: string): Promise<number[]> => {
      if (!isContractReady) return [];

      try {
        return await dataService.getUserPosts(userAddress);
      } catch (error) {
        console.error("Error getting user posts:", error);
        return [];
      }
    },
    [isContractReady]
  );

  const getTotalPosts = useCallback(async (): Promise<number> => {
    if (!isContractReady) return 0;

    try {
      return await dataService.getTotalPosts();
    } catch (error) {
      console.error("Error getting total posts:", error);
      return 0;
    }
  }, [isContractReady]);

  // Follow Functions
  const followUser = useCallback(
    async (userAddress: string) => {
      return executeTransaction(() => dataService.followUser(userAddress));
    },
    [executeTransaction]
  );

  const unfollowUser = useCallback(
    async (userAddress: string) => {
      return executeTransaction(() =>
        dataService.unfollowUser(userAddress)
      );
    },
    [executeTransaction]
  );

  const getFollowers = useCallback(
    async (userAddress: string): Promise<string[]> => {
      if (!isContractReady) return [];

      try {
        return await dataService.getFollowers(userAddress);
      } catch (error) {
        console.error("Error getting followers:", error);
        return [];
      }
    },
    [isContractReady]
  );

  const getFollowing = useCallback(
    async (userAddress: string): Promise<string[]> => {
      if (!isContractReady) return [];

      try {
        return await dataService.getFollowing(userAddress);
      } catch (error) {
        console.error("Error getting following:", error);
        return [];
      }
    },
    [isContractReady]
  );

  // Additional utility functions for enhanced functionality
  const getAllPosts = useCallback(
    async (limit: number = 50, offset: number = 0): Promise<Post[]> => {
      if (!isContractReady) return [];

      try {
        return await dataService.getAllPosts(limit, offset);
      } catch (error) {
        console.error("Error getting all posts:", error);
        return [];
      }
    },
    [isContractReady]
  );

  const getRecentPosts = useCallback(
    async (limit: number = 20): Promise<Post[]> => {
      if (!isContractReady) return [];

      try {
        return await dataService.getRecentPosts(limit);
      } catch (error) {
        console.error("Error getting recent posts:", error);
        return [];
      }
    },
    [isContractReady]
  );

  const getFeedPosts = useCallback(
    async (userAddress: string, limit: number = 20): Promise<Post[]> => {
      if (!isContractReady) return [];

      try {
        return await dataService.getFeedPosts(userAddress, limit);
      } catch (error) {
        console.error("Error getting feed posts:", error);
        return [];
      }
    },
    [isContractReady]
  );

  // Data mode utilities
  const getCurrentDataMode = useCallback(() => {
    return dataService.getCurrentMode();
  }, []);

  const setDataMode = useCallback((mode: DataMode) => {
    dataService.setMode(mode);
  }, []);

  return {
    // State
    isContractReady,
    error,
    loading,

    // User functions
    createProfile, // Changed name to match UserContext
    getUserProfile, // Changed name to match UserContext

    // Post functions
    createPost,
    getPost,
    getUserPosts,
    getTotalPosts,
    likePost,
    getAllPosts,
    getRecentPosts,
    getFeedPosts,

    // Follow functions
    followUser,
    unfollowUser, // Added missing unfollow function
    getFollowers,
    getFollowing,

    // Data mode utilities
    getCurrentDataMode,
    setDataMode,

    // Generic transaction executor
    executeTransaction,
  };
};
