// src/components/social/UserCard.tsx
import React from "react";
import type { User } from "../../types/user";
import { Button } from "../ui/Button";
import { formatAddress } from "../../lib/utils";

interface UserCardProps {
  user: User;
  onFollowToggle?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onFollowToggle }) => {
  const handleFollowClick = () => {
    if (onFollowToggle) onFollowToggle(user);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-2">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
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
            {user.username || formatAddress(user.address)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.postCount} posts • {user.followerCount} followers
          </p>
        </div>
      </div>
      {onFollowToggle && (
        <Button
          size="sm"
          variant={user.isFollowing ? "outline" : "default"}
          onClick={handleFollowClick}
        >
          {user.isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
};
