// src/types/user.ts

import type { Post } from "./post"; // use `import type` to avoid circular issues

export interface User {
  address: string;
  username: string;
  profilePictureHash?: string;
  profilePictureUrl?: string;
  isRegistered: boolean;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface UserProfile extends User {
  posts: Post[];
  followers: User[];
  following: User[];
}
