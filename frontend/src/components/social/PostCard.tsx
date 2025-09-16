// frontend/src/components/social/PostCard.tsx
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Post, UserProfile } from '../../types/contract';
import { useIPFS } from '../../hooks/useIPFS';
import { usePosts } from '../../hooks/usePosts';

interface PostCardProps {
  post: Post;
  authorProfile?: UserProfile;
  onProfileClick?: (address: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  authorProfile, 
  onProfileClick 
}) => {
  const { getFileUrl } = useIPFS();
  const { handleLikePost } = usePosts();
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    try {
      await handleLikePost(post.id);
      setLiked(!liked);
    } catch (error) {
      console.