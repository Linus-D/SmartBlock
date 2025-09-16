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
  postCount: number;
  followerCount: number;
  followingCount: number;
  isActive: boolean;
}

export interface ContractError {
  message: string;
  code?: string;
}

// frontend/src/hooks/usePosts.ts
import { useState, useEffect } from "react";
import { useContract } from "./useContract";
import { useWallet } from "./useWallet";
import { Post } from "../types/contract";

export const usePosts = () => {
  const { contract, getUserPosts, createPost, likePost, getPost } =
    useContract();
  const { address } = useWallet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserPosts = async (userAddress?: string) => {
    if (!contract) return;
    setLoading(true);
    try {
      const targetAddress = userAddress || address;
      if (targetAddress) {
        const userPosts = await getUserPosts(targetAddress);
        setPosts(userPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (content: string, imageHash?: string) => {
    try {
      await createPost(content, imageHash);
      // Refresh posts after creation
      await fetchUserPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await likePost(postId);
      // Update the specific post in state
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  };

  const fetchSinglePost = async (postId: number) => {
    if (!contract) return null;
    try {
      return await getPost(postId);
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  };

  useEffect(() => {
    if (address && contract) {
      fetchUserPosts();
    }
  }, [address, contract]);

  return {
    posts,
    loading,
    fetchUserPosts,
    handleCreatePost,
    handleLikePost,
    fetchSinglePost,
    refreshPosts: fetchUserPosts,
  };
};
