// frontend/src/context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useContract } from "../hooks/useContract"; // Make sure this hook correctly exports getUserProfile and createProfile
import { useWeb3 } from "../context/Web3Context";
import type { UserProfile } from "../types/contract";

interface CurrentUser {
  address: string;
  profile?: UserProfile;
  isRegistered: boolean;
}

interface UserContextType {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  registerUser: (
    username: string,
    bio?: string,
    profileImageHash?: string
  ) => Promise<void>;
  updateProfile: () => Promise<void>;
  followUser: (userAddress: string) => Promise<void>;
  unfollowUser: (userAddress: string) => Promise<void>;
  getOtherUserProfile: (userAddress: string) => Promise<UserProfile | null>;

  // Legacy compatibility
  profile: UserProfile | null;
  hasProfile: boolean;
  createUserProfile: (
    username: string,
    bio: string,
    profileImageHash?: string
  ) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { account, isConnected } = useWeb3();
  const {
    getUserProfile,
    createProfile,
    followUser: contractFollowUser,
  } = useContract();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to update state only if changed
  const safeSetCurrentUser = (user: CurrentUser) => {
    setCurrentUser((prev) => {
      if (
        prev?.address === user.address &&
        prev?.isRegistered === user.isRegistered &&
        prev?.profile?.username === user.profile?.username
      ) {
        return prev; // no update if unchanged
      }
      return user;
    });
  };

  // Fetch user profile safely
  const fetchUserProfile = async () => {
    const effectiveAccount =
      account || (import.meta.env.DEV ? "0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8" : null);

    if (!effectiveAccount && !import.meta.env.DEV) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await getUserProfile(effectiveAccount!);
      const isRegistered = Boolean(userProfile && userProfile.isRegistered);

      const user: CurrentUser = {
        address: effectiveAccount!,
        isRegistered,
        profile: isRegistered ? userProfile! : undefined,
      };

      safeSetCurrentUser(user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setCurrentUser({
        address: effectiveAccount!,
        isRegistered: false,
      });
      setError("Failed to fetch user profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (
    username: string,
    bio: string = "",
    profileImageHash?: string
  ): Promise<void> => {
    console.log("📝 UserContext: registerUser called with username:", username);
    
    const effectiveAccount =
      account || (import.meta.env.DEV ? "0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8" : null);

    console.log("🔍 UserContext: effectiveAccount:", effectiveAccount);
    console.log("🔍 UserContext: account:", account);
    console.log("🔍 UserContext: DEV mode:", import.meta.env.DEV);

    if (!effectiveAccount) throw new Error("Wallet not connected.");

    setIsLoading(true);
    setError(null);

    try {
      console.log("🚀 UserContext: Creating profile...");
      await createProfile(username, bio, profileImageHash);
      console.log("✅ UserContext: Profile created, fetching user profile...");
      await fetchUserProfile();

      // Immediate fallback to update state
      safeSetCurrentUser({
        address: effectiveAccount,
        isRegistered: true,
        profile: {
          username,
          bio: bio || "New SmartBlock user! 🚀",
          profileImageHash: profileImageHash || "QmDefaultProfileImage",
          postCount: 0,
          followerCount: 0,
          followingCount: 0,
          isActive: true,
          isRegistered: true,
        },
      });

      // Double-check profile after delay
      setTimeout(async () => {
        await fetchUserProfile();
      }, 500);
    } catch (err) {
      console.error("Error registering user:", err);
      setError("Failed to register user. Please check console for details.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (): Promise<void> => {
    await fetchUserProfile();
  };

  const followUser = async (userAddress: string): Promise<void> => {
    if (!account) throw new Error("No wallet connected");

    setIsLoading(true);
    setError(null);

    try {
      await contractFollowUser(userAddress);
      await fetchUserProfile();
    } catch (err) {
      console.error("Error following user:", err);
      setError("Failed to follow user.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userAddress: string): Promise<void> => {
    console.warn(
      "Unfollow functionality needs to be implemented in the smart contract and useContract hook."
    );
    // Remove unused parameter warning
    void userAddress;
  };

  const getOtherUserProfile = async (
    userAddress: string
  ): Promise<UserProfile | null> => {
    if (!userAddress) return null;

    try {
      const userProfile = await getUserProfile(userAddress);
      return userProfile && userProfile.isActive ? userProfile : null;
    } catch (err) {
      console.error(`Error fetching profile for ${userAddress}:`, err);
      return null;
    }
  };

  useEffect(() => {
    if (account && isConnected) {
      fetchUserProfile();
    } else if (import.meta.env.DEV) {
      fetchUserProfile();
    } else {
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [account, isConnected]);

  const profile = currentUser?.profile || null;
  const hasProfile = currentUser?.isRegistered || false;
  const createUserProfile = registerUser;

  const value = {
    currentUser,
    isLoading,
    error,
    registerUser,
    updateProfile,
    followUser,
    unfollowUser,
    getOtherUserProfile,
    profile,
    hasProfile,
    createUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
