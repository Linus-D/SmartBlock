// src/hooks/useContract.ts
import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import {
  contractService,
  type ContractUser,
  type ContractPost,
  type ContractComment,
  type UserProfile,
} from "../lib/contractService";
import { isSupportedNetwork } from "../lib/contractConfig";

export const useContract = () => {
  const { provider, signer, account, chainId, isConnected } = useWeb3();
  const [isContractReady, setIsContractReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize contract when wallet is connected
  useEffect(() => {
    if (isConnected && provider && chainId) {
      if (!isSupportedNetwork(chainId)) {
        setError(`Unsupported network. Please switch to a supported network.`);
        setIsContractReady(false);
        return;
      }

      try {
        if (signer) {
          contractService.initializeWithSigner(signer);
        } else {
          contractService.initializeWithProvider(provider);
        }
        setIsContractReady(true);
        setError(null);
      } catch (err: any) {
        setError(`Failed to initialize contract: ${err.message}`);
        setIsContractReady(false);
      }
    } else {
      setIsContractReady(false);
      if (!isConnected) {
        setError(null); // Clear error when disconnected
      }
    }
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
        contractService.createProfile(username, bio, profileImageHash)
      );
    },
    [executeTransaction]
  );

  const getUserProfile = useCallback(
    async (userAddress: string): Promise<UserProfile | null> => {
      if (!isContractReady) return null;

      try {
        return await contractService.getUserProfile(userAddress);
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
        contractService.createPost(content, ipfsHash)
      );
    },
    [executeTransaction]
  );

  const getPost = useCallback(
    async (postId: number): Promise<ContractPost | null> => {
      if (!isContractReady) return null;

      try {
        return await contractService.getPost(postId);
      } catch (error) {
        console.error("Error getting post:", error);
        return null;
      }
    },
    [isContractReady]
  );

  const likePost = useCallback(
    async (postId: number) => {
      return executeTransaction(() => contractService.likePost(postId));
    },
    [executeTransaction]
  );

  const getUserPosts = useCallback(
    async (userAddress: string): Promise<number[]> => {
      if (!isContractReady) return [];

      try {
        return await contractService.getUserPosts(userAddress);
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
      return await contractService.getTotalPosts();
    } catch (error) {
      console.error("Error getting total posts:", error);
      return 0;
    }
  }, [isContractReady]);

  // Follow Functions
  const followUser = useCallback(
    async (userAddress: string) => {
      return executeTransaction(() => contractService.followUser(userAddress));
    },
    [executeTransaction]
  );

  const unfollowUser = useCallback(
    async (userAddress: string) => {
      return executeTransaction(() =>
        contractService.unfollowUser(userAddress)
      );
    },
    [executeTransaction]
  );

  const getFollowers = useCallback(
    async (userAddress: string): Promise<string[]> => {
      if (!isContractReady) return [];

      try {
        return await contractService.getFollowers(userAddress);
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
        return await contractService.getFollowing(userAddress);
      } catch (error) {
        console.error("Error getting following:", error);
        return [];
      }
    },
    [isContractReady]
  );

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

    // Follow functions
    followUser,
    unfollowUser, // Added missing unfollow function
    getFollowers,
    getFollowing,

    // Generic transaction executor
    executeTransaction,
  };
};
