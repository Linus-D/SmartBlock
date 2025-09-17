// frontend/src/context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useContract } from "../hooks/useContract"; // Make sure this hook correctly exports getUserProfile and createProfile
import { useWeb3 } from "../context/Web3Context";
import type { UserProfile } from "../types/contract"; // Ensure UserProfile type is correctly defined

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

  // Legacy compatibility - keeping these for backward compatibility
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
  // Ensure your useContract hook correctly exports getUserProfile and createProfile
  const {
    getUserProfile,
    createProfile,
    followUser: contractFollowUser, // Alias for clarity if needed
    // Assuming other contract functions like unfollowUser, getOtherUserProfile might be here too
  } = useContract();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetches the user profile from the smart contract for the current connected account
  const fetchUserProfile = async () => {
    // In development/mock mode, use a default account if none is connected
    const effectiveAccount = account || (import.meta.env.DEV ? '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8' : null);

    if (!effectiveAccount && !import.meta.env.DEV) {
      setCurrentUser(null); // Clear user if disconnected or no account
      setIsLoading(false); // Ensure loading is false if not connected
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await getUserProfile(effectiveAccount);
      console.log('📊 Fetched profile:', {
        address: effectiveAccount,
        profile: userProfile,
        isActive: userProfile?.isActive,
        username: userProfile?.username
      });

      // Check if userProfile is valid and has an active status
      const isRegistered = Boolean(userProfile && userProfile.isActive);

      console.log('🔍 Registration check:', {
        hasProfile: !!userProfile,
        isActive: userProfile?.isActive,
        isActiveType: typeof userProfile?.isActive,
        isRegistered: isRegistered,
        isRegisteredType: typeof isRegistered
      });

      const user: CurrentUser = {
        address: effectiveAccount,
        isRegistered: isRegistered,
        profile: isRegistered ? userProfile : undefined, // Only assign profile if registered
      };

      console.log('✅ Setting currentUser:', {
        address: user.address,
        isRegistered: user.isRegistered,
        isRegisteredType: typeof user.isRegistered,
        username: user.profile?.username
      });
      setCurrentUser(user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // If there's an error fetching the profile, we assume the user is not registered yet.
      // We still set the current user with the account, indicating they exist but aren't registered.
      setCurrentUser({
        address: effectiveAccount,
        isRegistered: false,
        // profile will be undefined here as they are not registered
      });
      setError("Failed to fetch user profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Registers a new user with a username, bio, and optional profile image hash
  const registerUser = async (
    username: string,
    bio: string = "",
    profileImageHash?: string
  ): Promise<void> => {
    // In development/mock mode, use a default account if none is connected
    const effectiveAccount = account || (import.meta.env.DEV ? '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8' : null);

    if (!effectiveAccount) throw new Error("Wallet not connected.");

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Creating profile for:', username);
      await createProfile(username, bio, profileImageHash);
      console.log('🔄 Fetching updated profile...');
      await fetchUserProfile(); // Refresh profile after creation to reflect registration

      // Immediate fallback: Set user as registered if profile creation succeeded
      const effectiveAccount = account || (import.meta.env.DEV ? '0x742d35Cc5FE4C9c5b6f8e8F57b7dB8D8d8d8d8d8' : null);
      if (effectiveAccount) {
        console.log('🔧 Immediate state update: Setting user as registered');
        setCurrentUser(prev => ({
          address: effectiveAccount,
          isRegistered: true,
          profile: {
            username: username,
            bio: bio || 'New SmartBlock user! 🚀',
            profileImageHash: profileImageHash || 'QmDefaultProfileImage',
            postCount: 0,
            followerCount: 0,
            followingCount: 0,
            isActive: true,
          }
        }));
      }

      // Force another profile fetch after a short delay to ensure data consistency
      setTimeout(async () => {
        console.log('🔄 Double-checking profile after registration...');
        await fetchUserProfile();
      }, 500);

      console.log('✅ Registration completed in UserContext');
    } catch (err) {
      console.error("Error registering user:", err);
      setError("Failed to register user. Please check console for details.");
      throw err; // Re-throw the error to be caught by the component using this context
    } finally {
      setIsLoading(false);
    }
  };

  // Updates the current user's profile by re-fetching
  const updateProfile = async (): Promise<void> => {
    await fetchUserProfile();
  };

  // Follows another user
  const followUser = async (userAddress: string): Promise<void> => {
    if (!account) throw new Error("No wallet connected");

    setIsLoading(true);
    setError(null);

    try {
      await contractFollowUser(userAddress);
      await fetchUserProfile(); // Refresh to update follower/following counts
    } catch (err) {
      console.error("Error following user:", err);
      setError("Failed to follow user.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Unfollows another user
  const unfollowUser = async (userAddress: string): Promise<void> => {
    // Placeholder: You'll need to implement this in your smart contract and expose it via useContract hook
    console.warn(
      "Unfollow functionality needs to be implemented in the smart contract and useContract hook."
    );
    // Example if it were implemented:
    // setIsLoading(true);
    // setError(null);
    // try {
    //   await contractUnfollowUser(userAddress); // Assuming contractUnfollowUser exists
    //   await fetchUserProfile();
    // } catch (err) {
    //   console.error("Error unfollowing user:", err);
    //   setError("Failed to unfollow user.");
    //   throw err;
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Fetches the profile of another user by their address
  const getOtherUserProfile = async (
    userAddress: string
  ): Promise<UserProfile | null> => {
    if (!userAddress) return null; // Handle cases where address might be empty

    try {
      const userProfile = await getUserProfile(userAddress);
      // Return profile only if it's active
      return userProfile && userProfile.isActive ? userProfile : null;
    } catch (err) {
      console.error(`Error fetching profile for ${userAddress}:`, err);
      return null; // Return null on error or if profile not found/active
    }
  };

  // Effect to fetch the current user's profile when the account or connection status changes
  useEffect(() => {
    if (account && isConnected) {
      fetchUserProfile();
    } else if (import.meta.env.DEV) {
      // In development mode, try to fetch profile even without wallet connection
      console.log('🔧 Dev mode: Fetching user profile without wallet connection');
      fetchUserProfile();
    } else {
      setCurrentUser(null); // Clear user data if disconnected or no account
      setIsLoading(false); // Ensure loading is false
    }
  }, [account, isConnected]); // Depend on account and isConnected

  // --- Legacy Compatibility Aliases ---
  // These map the older interface names to the new ones for backward compatibility
  const profile = currentUser?.profile || null;
  const hasProfile = currentUser?.isRegistered || false;
  const createUserProfile = registerUser; // Alias registerUser for createUserProfile

  // Combine all values to be provided by the context
  const value = {
    currentUser,
    isLoading,
    error,
    registerUser,
    updateProfile,
    followUser,
    unfollowUser,
    getOtherUserProfile,
    // Legacy compatibility
    profile,
    hasProfile,
    createUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
