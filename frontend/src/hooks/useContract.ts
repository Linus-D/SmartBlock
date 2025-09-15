// src/hooks/useContract.ts
import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import contractJson from "../constants/contract.json";
import { useWeb3 } from "../context/Web3Context";

/**
 * Environment
 */
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export interface TxState<T = any> {
  loading: boolean;
  error: string | null;
  data?: T;
}

/**
 * Hook: useContract
 * Provides ready-to-use methods for user, post, comment & messaging features.
 */
export function useContract() {
  const { provider, signer } = useWeb3();

  // This hook is always called, so it's a valid use of useMemo.
  const contract = useMemo(() => {
    if (!provider || !signer) return null;
    return new ethers.Contract(contractAddress, contractJson.abi, signer);
  }, [provider, signer]);

  /**
   * Generic helper for write transactions with state management
   */
  const runTx = useCallback(
    async <T>(fn: () => Promise<T>): Promise<TxState<T>> => {
      const state: TxState<T> = { loading: true, error: null };
      try {
        const result = await fn();
        state.data = result;
      } catch (err: any) {
        console.error("Contract call failed:", err);
        state.error = err?.message ?? "Transaction failed";
      } finally {
        state.loading = false;
      }
      return state;
    },
    []
  );

  /**
   * USER MANAGEMENT
   * These useCallback hooks are now called unconditionally, fixing the order issue.
   */
  const registerUser = useCallback(
    (username: string, profileCID: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.registerUser(username, profileCID));
    },
    [contract, runTx]
  );

  const updateProfile = useCallback(
    (username: string, profileCID: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.updateProfile(username, profileCID));
    },
    [contract, runTx]
  );

  const getUser = useCallback(
    (address: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.getUser(address));
    },
    [contract, runTx]
  );

  /**
   * SOCIAL GRAPH
   */
  const followUser = useCallback(
    (userAddr: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.follow(userAddr));
    },
    [contract, runTx]
  );

  const unfollowUser = useCallback(
    (userAddr: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.unfollow(userAddr));
    },
    [contract, runTx]
  );

  const getFollowers = useCallback(
    (userAddr: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.getFollowers(userAddr));
    },
    [contract, runTx]
  );

  const getFollowing = useCallback(
    (userAddr: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.getFollowing(userAddr));
    },
    [contract, runTx]
  );

  /**
   * POST MANAGEMENT
   */
  const createPost = useCallback(
    (contentCID: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.createPost(contentCID));
    },
    [contract, runTx]
  );

  const likePost = useCallback(
    (postId: number) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.likePost(postId));
    },
    [contract, runTx]
  );

  const unlikePost = useCallback(
    (postId: number) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.unlikePost(postId));
    },
    [contract, runTx]
  );

  const sharePost = useCallback(
    (postId: number) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.sharePost(postId));
    },
    [contract, runTx]
  );

  const getPosts = useCallback(() => {
    if (!contract) return { loading: false, error: "Wallet not connected" };
    return runTx(() => contract.getAllPosts());
  }, [contract, runTx]);

  /**
   * COMMENTS
   */
  const addComment = useCallback(
    (postId: number, contentCID: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.addComment(postId, contentCID));
    },
    [contract, runTx]
  );

  const getComments = useCallback(
    (postId: number) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.getComments(postId));
    },
    [contract, runTx]
  );

  /**
   * MESSAGING
   */
  const createChat = useCallback(
    (recipient: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.createChat(recipient));
    },
    [contract, runTx]
  );

  const sendMessage = useCallback(
    (chatId: number, messageCID: string) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.sendMessage(chatId, messageCID));
    },
    [contract, runTx]
  );

  const getMessages = useCallback(
    (chatId: number) => {
      if (!contract) return { loading: false, error: "Wallet not connected" };
      return runTx(() => contract.getMessages(chatId));
    },
    [contract, runTx]
  );

  return {
    contract,
    registerUser,
    updateProfile,
    getUser,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    createPost,
    likePost,
    unlikePost,
    sharePost,
    getPosts,
    addComment,
    getComments,
    createChat,
    sendMessage,
    getMessages,
  };
}
