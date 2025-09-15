// src/types/post.ts

export interface Post {
  id: number;
  author: string;
  authorUsername: string;
  authorProfilePicture?: string;
  content: string;
  ipfsHash?: string;
  mediaUrl?: string;
  timestamp: number; // Unix timestamp
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isShared?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  authorUsername: string;
  authorProfilePicture?: string;
  content: string;
  timestamp: number; // Unix timestamp
}

export interface CreatePostData {
  content: string;
  file?: File;
}

export interface CreateCommentData {
  postId: number;
  content: string;
}
