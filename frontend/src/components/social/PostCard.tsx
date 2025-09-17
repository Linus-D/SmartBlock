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
      console.error('Error liking post:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Post content will go here */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span>{post.likes || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};