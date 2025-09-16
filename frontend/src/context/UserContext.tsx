// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/user";
import { useWeb3 } from "./Web3Context";
import { useContract } from "../hooks/useContract";

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  registerUser: (username: string) => Promise<void>;
  updateProfilePicture: (ipfsHash: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { account, isConnected } = useWeb3();
  const {
    getUserInfo,
    registerUserOnContract,
    updateUserProfile,
    getFollowers,
    getFollowing,
    getUserPosts
  } = useContract();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
    } else {
      setCurrentUser(null);
    }
  }, [account, isConnected]);

  const loadUserData = async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      const userInfo = await getUserInfo(account);
      if (userInfo) {
        // Get follower and following counts
        const followers = await getFollowers(account);
        const following = await getFollowing(account);
        const userPosts = await getUserPosts(account);

        setCurrentUser({
          address: account,
          username: userInfo.username || "",
          profilePictureHash: userInfo.profilePictureHash || "",
          isRegistered: userInfo.isRegistered || false,
          postCount: userPosts.length || 0,
          followerCount: followers.length || 0,
          followingCount: following.length || 0,
        });
      } else {
        // User not found, set as unregistered
        setCurrentUser({
          address: account,
          username: "",
          profilePictureHash: "",
          isRegistered: false,
          postCount: 0,
          followerCount: 0,
          followingCount: 0,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setCurrentUser({
        address: account,
        username: "",
        profilePictureHash: "",
        isRegistered: false,
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (username: string) => {
    if (!account) throw new Error("No wallet connected");

    setIsLoading(true);
    try {
      await registerUserOnContract(username);
      await loadUserData();
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (ipfsHash: string) => {
    if (!account) throw new Error("No wallet connected");

    setIsLoading(true);
    try {
      await updateUserProfile(ipfsHash);
      await loadUserData();
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    await loadUserData();
  };

  const value = {
    currentUser,
    isLoading,
    registerUser,
    updateProfilePicture,
    refreshUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
