// frontend/src/components/social/PostCard.tsx
import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Post, UserProfile } from '../../types/contract';
import { useContract } from '../../hooks/useContract';

interface PostCardProps {
  post: Post;
  authorProfile?: UserProfile;
  onProfileClick?: (address: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post
}) => {
  const { } = useContract(); // TODO: Add likePost method to useContract hook
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    try {
      // TODO: Implement likePost functionality
      console.log('Liking post:', post.id);
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
            disabled={liking}
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