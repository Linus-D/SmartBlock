import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Verified,
  TrendingUp,
  X,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import Layout from "../components/layout/Layout";
import Web3Dashboard from "../components/dashboard/Web3Dashboard";
import { AIRecommendations } from "../components/recommendations";
import ImageUploadComponent from "../components/ui/ImageUploadComponent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ModernLoader from "../components/ui/ModernLoader";

// User profiles with interests for recommendation system
const users = {
  "0x742d35Cc6635C0532FED36077723295bb9c3DDDD": {
    username: "Deborah",
    avatar: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=150&h=150&fit=crop&crop=face",
    verified: false,
    followers: 1,
    following: 2,
    interests: ["DeFi", "NFT", "Web3", "Blockchain"]
  },
  "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12": {
    username: "Alex_Crypto",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    verified: false,
    followers: 2,
    following: 1,
    interests: ["DeFi", "Layer2", "Trading", "DAO"]
  },
  "0x9876543210fedcba0987654321fedcba09876543": {
    username: "Sarah_Web3",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    verified: false,
    followers: 3,
    following: 1,
    interests: ["NFT", "Art", "Gaming", "Metaverse"]
  }
};

// Fresh mock data with 3 users
const mockPosts = [
  {
    id: "1",
    author: "0x742d35Cc6635C0532FED36077723295bb9c3DDDD",
    body: "Just staked 0.1 ETH in the new DeFi pool! 🌊 Learning about decentralized finance step by step. #DeFi #Learning #Web3",
    image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=600&h=400&fit=crop",
    createdAt: { toDate: () => new Date(Date.now() - 3600000) },
    likes: 2,
    comments: 1,
    shares: 1,
    topics: ["DeFi", "Learning"]
  },
  {
    id: "2",
    author: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    body: "Exploring Layer 2 solutions! Just tried a testnet transaction - amazing how fast it is! #Layer2 #Ethereum #Testing",
    createdAt: { toDate: () => new Date(Date.now() - 7200000) },
    likes: 3,
    comments: 1,
    shares: 1,
    topics: ["Layer2", "Ethereum", "Testing"]
  },
  {
    id: "3",
    author: "0x9876543210fedcba0987654321fedcba09876543",
    body: "Creating my first NFT art piece! 🎨 Excited to learn about digital art on blockchain. Still figuring things out but loving the journey.",
    image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=600&h=400&fit=crop",
    createdAt: { toDate: () => new Date(Date.now() - 10800000) },
    likes: 1,
    comments: 2,
    shares: 1,
    topics: ["NFT", "Art", "Learning"]
  }
];

// Post Component with Enhanced UI and Follow functionality
const PostCard: React.FC<{ post: any; currentUser: string; followingUsers: Set<string>; onFollow: (userId: string) => void; onUnfollow: (userId: string) => void; onInteraction: (postId: string, topic: string) => void }> = ({
  post,
  currentUser,
  followingUsers,
  onFollow,
  onUnfollow,
  onInteraction
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments] = useState(post.comments || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [isExpanded, setIsExpanded] = useState(false);

  const user = users[post.author as keyof typeof users];
  const isFollowing = followingUsers.has(post.author);
  const isOwnPost = post.author === currentUser;

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    // Track interaction for recommendations
    if (post.topics) {
      post.topics.forEach((topic: string) => {
        onInteraction(post.id, topic);
      });
    }
  };

  const handleShare = () => {
    setShares(shares + 1);
    navigator.clipboard?.writeText(`Check out this post: ${post.body.slice(0, 50)}...`);
  };

  const handleFollow = () => {
    if (isFollowing) {
      onUnfollow(post.author);
    } else {
      onFollow(post.author);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300"
    >
      {/* Post Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                alt={user?.username || 'User'}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              {user?.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.username || `${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
                </h3>
                {user?.verified && (
                  <Verified className="w-4 h-4 text-blue-500 fill-current" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatNumber(user?.followers || 0)} followers</span>
                <span>•</span>
                <span>{post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Now"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isOwnPost && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isFollowing
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 inline mr-1" />
                    Follow
                  </>
                )}
              </motion.button>
            )}

            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 py-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">
          {post.body}
        </p>

        {/* Topics/Tags */}
        {post.topics && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.topics.map((topic: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="px-6 pb-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-64 object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                liked
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{formatNumber(likes)}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{formatNumber(comments)}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-all duration-200"
            >
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">{formatNumber(shares)}</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Block #{Math.floor(Math.random() * 1000000)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Create Post Component with Image Upload
const CreatePost: React.FC<{ onNewPost: (post: any) => void; currentAccount: string }> = ({ onNewPost, currentAccount }) => {
  const [postBody, setPostBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const user = users[currentAccount as keyof typeof users];

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim()) return;

    setIsPosting(true);
    try {
      // Simulate posting to blockchain/IPFS
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract topics from post content
      const topics = extractTopics(postBody);

      const newPost = {
        id: Date.now().toString(),
        author: currentAccount,
        body: postBody,
        image: postImage,
        topics: topics,
        createdAt: { toDate: () => new Date() },
        likes: 0,
        comments: 0,
        shares: 0
      };

      onNewPost(newPost);
      setPostBody("");
      setPostImage(null);
      setShowImageUpload(false);

      // Show success feedback
      console.log("Post successfully added to blockchain!");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const extractTopics = (text: string): string[] => {
    const keywords = ['DeFi', 'NFT', 'Web3', 'Blockchain', 'Layer2', 'DAO', 'Ethereum', 'Crypto', 'Staking', 'Trading'];
    return keywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleImageUpload = (_file: File, preview: string) => {
    setPostImage(preview);
    setShowImageUpload(false);
  };

  const removeImage = () => {
    setPostImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-lg"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentAccount}`}
            alt="Your avatar"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user?.username || 'You'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share your thoughts with the community
            </p>
          </div>
        </div>

        <form onSubmit={handlePost} className="space-y-4">
          <textarea
            className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="What's happening in Web3? Share your insights..."
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            disabled={isPosting}
          />

          {/* Image Preview */}
          {postImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={postImage}
                alt="Post preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Image Upload */}
          <AnimatePresence>
            {showImageUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ImageUploadComponent
                  onImageUpload={handleImageUpload}
                  onImageRemove={removeImage}
                  type="post"
                  className="mb-4"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Add Photo</span>
              </motion.button>

              <div className="text-xs text-gray-400 dark:text-gray-500">
                {postBody.length}/280
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!postBody.trim() || isPosting || postBody.length > 280}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-xl transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isPosting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                "Post to Blockchain"
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {isPosting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
        >
          <div className="text-center p-6">
            <LoadingSpinner size="md" variant="primary" color="blue" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Publishing to blockchain...
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Main Feed Component with Smart Recommendations and Follow System
const Feed: React.FC = () => {
  const { account } = useWeb3();
  const [posts, setPosts] = useState(mockPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [userInteractions, setUserInteractions] = useState<Record<string, number>>({});

  // Mock account for demo purposes if no wallet connected
  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const currentAccount = account || mockAccount;

  // Initialize loading and user data
  useEffect(() => {
    const initializeData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    initializeData();
  }, []);

  const handleNewPost = (newPost: any) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleFollow = (userId: string) => {
    setFollowingUsers(prev => new Set([...prev, userId]));
  };

  const handleUnfollow = (userId: string) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleInteraction = (_postId: string, topic: string) => {
    setUserInteractions(prev => ({
      ...prev,
      [topic]: (prev[topic] || 0) + 1
    }));
  };


  const loadMorePosts = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const authorKeys = Object.keys(users);
    const randomAuthor = authorKeys[Math.floor(Math.random() * authorKeys.length)];

    const samplePosts = [
      {
        id: Date.now().toString(),
        author: randomAuthor,
        body: "The future of finance is decentralized! Just swapped tokens on a DEX with 0.1% slippage. Amazing! 🔄 #DeFi #DEX #Swap",
        topics: ["DeFi", "Trading"],
        createdAt: { toDate: () => new Date(Date.now() - Math.random() * 86400000) },
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 15),
        shares: Math.floor(Math.random() * 10)
      },
      {
        id: (Date.now() + 1).toString(),
        author: authorKeys[Math.floor(Math.random() * authorKeys.length)],
        body: "Building on Ethereum Layer 2 is a game changer! Transaction costs under a penny ⚡ #Layer2 #Ethereum #Scaling",
        topics: ["Layer2", "Ethereum"],
        createdAt: { toDate: () => new Date(Date.now() - Math.random() * 86400000) },
        likes: Math.floor(Math.random() * 75),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 15)
      }
    ];

    setPosts(prevPosts => [...prevPosts, ...samplePosts]);
    setIsLoadingMore(false);
  };

  // Show loading spinner instead of full loading screen
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" variant="primary" color="blue" />
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Loading SmartBlock...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connecting to the decentralized network
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Enhanced Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* User Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-lg"
              >
                <div className="text-center">
                  <img
                    src={users[currentAccount as keyof typeof users]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentAccount}`}
                    alt="Your avatar"
                    className="w-16 h-16 rounded-full mx-auto mb-3 ring-4 ring-blue-500/20"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {users[currentAccount as keyof typeof users]?.username || 'You'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {users[currentAccount as keyof typeof users]?.followers || 0} followers
                  </p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-500">{followingUsers.size}</div>
                      <div className="text-gray-500 dark:text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-500">{posts.filter(p => p.author === currentAccount).length}</div>
                      <div className="text-gray-500 dark:text-gray-400">Posts</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Web3 Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Web3Dashboard />
              </motion.div>

              {/* AI Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden"
              >
                <AIRecommendations userInteractions={userInteractions} className="" />
              </motion.div>

            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CreatePost onNewPost={handleNewPost} currentAccount={currentAccount} />
              </motion.div>

              {/* Posts Feed */}
              <div className="space-y-6">
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard
                        post={post}
                        currentUser={currentAccount}
                        followingUsers={followingUsers}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                        onInteraction={handleInteraction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More Button */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMorePosts}
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-xl transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Load More Posts"
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Right Sidebar - Smart Recommendations */}
            <div className="lg:col-span-3 space-y-6">
              {/* Enhanced Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {[
                    { tag: "#DeFi", posts: "3", trend: "+1" },
                    { tag: "#NFTs", posts: "2", trend: "+1" },
                    { tag: "#Web3", posts: "3", trend: "+2" },
                    { tag: "#Layer2", posts: "1", trend: "+1" },
                    { tag: "#Learning", posts: "2", trend: "+2" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 p-3 rounded-xl transition-all cursor-pointer"
                    >
                      <div>
                        <span className="text-blue-500 hover:text-blue-600 font-medium">{item.tag}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.posts} posts</div>
                      </div>
                      <span className="text-xs text-green-500 font-medium">+{item.trend}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recommended Users */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Suggested for You</h3>
                <div className="space-y-4">
                  {Object.entries(users)
                    .filter(([address]) => address !== currentAccount && !followingUsers.has(address))
                    .slice(0, 3)
                    .map(([address, user]) => (
                      <div key={address} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {user.username}
                              </span>
                              {user.verified && (
                                <Verified className="w-3 h-3 text-blue-500 fill-current" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.followers.toLocaleString()} followers
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFollow(address)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Follow
                        </motion.button>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Your Interests */}
              {Object.keys(userInteractions).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(userInteractions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([topic, count]) => (
                        <span
                          key={topic}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full flex items-center space-x-1"
                        >
                          <span>#{topic}</span>
                          <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full px-1 text-xs">
                            {count}
                          </span>
                        </span>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Platform Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
                    <span className="text-blue-500 font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                    <span className="text-green-500 font-semibold">{Object.keys(users).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Engagement</span>
                    <span className="text-purple-500 font-semibold">
                      {posts.reduce((sum, post) => sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0), 0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
