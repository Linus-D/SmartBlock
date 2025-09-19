// src/pages/Explore.tsx
import React, { useEffect, useState } from "react";
import type { UserProfile } from "../types/contract";
import { useWeb3 } from "../context/Web3Context";
import { useContract } from "../hooks/useContract";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const Explore: React.FC = () => {
  const { account } = useWeb3();
  const { getAllUsers } = useContract();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (account) fetchUsers();
  }, [account, getAllUsers]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid gap-4">
        {users.map((user, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.profileImageHash ? (
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${user.profileImageHash}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 dark:text-gray-300 font-bold">
                    {user.username?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user.username || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.postCount} posts • {user.followerCount} followers
                </p>
                {user.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore; // ✅ Default export
