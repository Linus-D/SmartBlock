// src/hooks/useContract.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useWeb3 } from "../context/Web3Context";
import { dataService } from "../lib/dataService";
import type {
  UserProfile,
} from "../types/contract";
import { isSupportedNetwork, CONTRACT_CONFIG } from "../lib/contractConfig";
import { ethers } from "ethers";

export const useContract = () => {
  const { provider, signer, account, chainId, isConnected } = useWeb3();
  const [isContractReady, setIsContractReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize ethers Contract instances separately for read and write
  const readOnlyContract = useMemo(() => {
    if (!provider || !chainId || !isSupportedNetwork(chainId)) return null;
    try {
      return new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        provider
      );
    } catch (err) {
      console.error("Error creating read-only contract", err);
      return null;
    }
  }, [provider, chainId]);

  const writableContract = useMemo(() => {
    if (!signer || !chainId || !isSupportedNetwork(chainId)) return null;
    try {
      return new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        signer
      );
    } catch (err) {
      console.error("Error creating writable contract", err);
      return null;
    }
  }, [signer, chainId]);

  // Initialize dataService with appropriate contract instances
  useEffect(() => {
    const initializeDataService = async () => {
      if (isConnected && (readOnlyContract || writableContract)) {
        try {
          if (signer) {
            await dataService.initializeWithSigner(signer);
          } else if (provider) {
            await dataService.initializeWithProvider(provider);
          }
          setIsContractReady(true);
          setError(null);

          const mode = dataService.getCurrentMode();
          console.log(
            `Data service initialized: ${mode.mode} mode, using ${
              mode.usingMock ? "mock" : "real"
            } data`
          );
        } catch (err: any) {
          setError(`Failed to initialize data service: ${err.message}`);
          setIsContractReady(false);
        }
      } else {
        // In dev mode, initialize with mock data if no wallet connection
        if (import.meta.env.DEV) {
          try {
            await dataService.initializeWithProvider(null);
            setIsContractReady(true);
            setError(null);
          } catch (err: any) {
            console.warn("Failed to initialize mock data service:", err.message);
          }
        } else {
          setIsContractReady(false);
          if (!isConnected) setError(null); // clear error on disconnect
        }
      }
    };

    initializeDataService();
  }, [isConnected, readOnlyContract, writableContract]);

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
      if (!isContractReady && !import.meta.env.DEV) {
        console.log("⚠️ Contract not ready, returning null");
        return null;
      }

      try {
        console.log("🔄 Getting user profile from dataService for:", userAddress);
        const profile = await dataService.getUserProfile(userAddress);
        console.log("📊 DataService returned profile:", profile);
        return profile;
      } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
      }
    },
    [isContractReady]
  );

  // Follow function to satisfy UserContext requirements
  const followUser = useCallback(
    async (userAddress: string) => {
      return executeTransaction(() => dataService.followUser(userAddress));
    },
    [executeTransaction]
  );

  // Data mode utilities
  const getCurrentDataMode = useCallback(() => {
    return dataService.getCurrentMode();
  }, []);

  const setDataMode = useCallback((mode: any) => {
    dataService.setMode(mode);
  }, []);

  // Additional methods needed by components
  const getAllUsers = useCallback(async () => {
    if (!isContractReady && !import.meta.env.DEV) return [];
    try {
      return await dataService.getAllUsers();
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }, [isContractReady]);

  const createChat = useCallback(
    async (participantAddress: string) => {
      return executeTransaction(() => dataService.createChat(participantAddress));
    },
    [executeTransaction]
  );

  const sendMessage = useCallback(
    async (chatId: string, content: string) => {
      return executeTransaction(() => dataService.sendMessage(chatId, content));
    },
    [executeTransaction]
  );

  const getUserInfo = useCallback(
    async (userAddress: string) => {
      return getUserProfile(userAddress);
    },
    [getUserProfile]
  );

  // Return all functions and state
  return {
    isContractReady,
    error,
    loading,
    createProfile,
    getUserProfile,
    followUser,
    executeTransaction,
    getCurrentDataMode,
    setDataMode,
    getAllUsers,
    createChat,
    sendMessage,
    getUserInfo,
  };
};
