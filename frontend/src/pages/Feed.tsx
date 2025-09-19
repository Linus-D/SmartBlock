import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Image
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import Layout from "../components/layout/Layout";
import Web3Dashboard from "../components/dashboard/Web3Dashboard";

// Mock data service for posts
const mockPosts = [
  {
    id: "1",
    author: "0x1234567890123456789012345678901234567890",
    body: "Just deployed my first smart contract on the blockchain! The future of decentralized applications is here. 🚀 #Web3 #Blockchain #DeFi",
    createdAt: { toDate: () => new Date(Date.now() - 3600000) },
    likes: 24,
    comments: 5,
    shares: 3
  },
  {
    id: "2",
    author: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    body: "Loving this decentralized social platform! No censorship, no data harvesting, just pure peer-to-peer communication. This is what the internet was meant to be. 🌐",
    createdAt: { toDate: () => new Date(Date.now() - 7200000) },
    likes: 42,
    comments: 12,
    shares: 8
  },
  {
    id: "3",
    author: "0x9876543210987654321098765432109876543210",
    body: "Gas fees are getting crazy high lately. Anyone know of good L2 solutions for social media dApps? Looking into Polygon and Arbitrum. 💸 #Layer2 #Ethereum",
    createdAt: { toDate: () => new Date(Date.now() - 10800000) },
    likes: 18,
    comments: 15,
    shares: 2
  },
  {
    id: "4",
    author: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    body: "NFT drop going live in 30 minutes! 🎨 Limited collection of 10,000 unique blockchain art pieces. Minting price: 0.05 ETH. Don't miss out! #NFT #Art #Crypto",
    createdAt: { toDate: () => new Date(Date.now() - 14400000) },
    likes: 89,
    comments: 23,
    shares: 45
  },
  {
    id: "5",
    author: "0xcafebabecafebabecafebabecafebabecafebabe",
    body: "DAO proposal is live! Vote on the future direction of our protocol. Every token holder has a voice in the decentralized governance process. 🗳️ #DAO #Governance #DeFi",
    createdAt: { toDate: () => new Date(Date.now() - 18000000) },
    likes: 156,
    comments: 34,
    shares: 67
  }
];

// Post Component with Mock Data Integration
const PostCard: React.FC<{ post: any }> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments] = useState(post.comments || 0);
  const [shares, setShares] = useState(post.shares || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleShare = () => {
    setShares(shares + 1);
    // Simulate sharing action
    navigator.clipboard?.writeText(`Check out this post: ${post.body.slice(0, 50)}...`);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {post.author.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {post.author.slice(0, 6)}...{post.author.slice(-4)}
            </p>
            <p className="text-xs text-gray-400">
              {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Now"}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-200 leading-relaxed">{post.body}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm">{likes}</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{comments}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
          >
            <Share className="w-5 h-5" />
            <span className="text-sm">{shares}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Block #{Math.floor(Math.random() * 1000000)}</span>
          <span>•</span>
          <span>Gas: {Math.floor(Math.random() * 50 + 20)} Gwei</span>
        </div>
      </div>
    </div>
  );
};

// Create Post Component with Mock Integration
const CreatePost: React.FC<{ onNewPost: (post: any) => void; currentAccount: string }> = ({ onNewPost, currentAccount }) => {
  const [postBody, setPostBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim()) return;

    setIsPosting(true);
    try {
      // Simulate posting to blockchain/IPFS
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPost = {
        id: Date.now().toString(),
        author: currentAccount,
        body: postBody,
        createdAt: { toDate: () => new Date() },
        likes: 0,
        comments: 0,
        shares: 0
      };

      onNewPost(newPost);
      setPostBody("");

      // Show success feedback
      console.log("Post successfully added to blockchain!");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Create Post</h3>
      <form onSubmit={handlePost} className="space-y-4">
        <textarea
          className="w-full min-h-[120px] p-4 rounded-xl bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Share your thoughts on the decentralized web..."
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
          disabled={isPosting}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Image className="w-5 h-5" />
              <span className="text-sm">Photo</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={!postBody.trim() || isPosting}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isPosting ? "Posting..." : "Post to Chain"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Feed Component with Enhanced Mock Data
const Feed: React.FC = () => {
  const { account } = useWeb3();
  const [posts, setPosts] = useState(mockPosts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Mock account for demo purposes if no wallet connected
  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const currentAccount = account || mockAccount;

  const handleNewPost = (newPost: any) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const loadMorePosts = async () => {
    setIsLoadingMore(true);
    // Simulate loading more posts
    await new Promise(resolve => setTimeout(resolve, 1000));

    const morePosts = [
      {
        id: Date.now().toString(),
        author: "0x" + Math.random().toString(16).substr(2, 40),
        body: "Exploring new DeFi protocols! The yield farming opportunities are incredible. 🌾 #DeFi #YieldFarming #Crypto",
        createdAt: { toDate: () => new Date(Date.now() - Math.random() * 86400000) },
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 15),
        shares: Math.floor(Math.random() * 10)
      },
      {
        id: (Date.now() + 1).toString(),
        author: "0x" + Math.random().toString(16).substr(2, 40),
        body: "Smart contract audit completed! Security is paramount in the Web3 space. Always DYOR! 🔐 #SmartContracts #Security #Audit",
        createdAt: { toDate: () => new Date(Date.now() - Math.random() * 86400000) },
        likes: Math.floor(Math.random() * 75),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 15)
      }
    ];

    setPosts(prevPosts => [...prevPosts, ...morePosts]);
    setIsLoadingMore(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar with Web3Dashboard */}
          <div className="lg:col-span-1 space-y-6">
            <Web3Dashboard />

            {/* Trending Topics */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Trending Topics</h3>
              <div className="space-y-3">
                {[
                  { tag: "#DeFi", posts: "156K" },
                  { tag: "#NFTs", posts: "89K" },
                  { tag: "#Web3", posts: "234K" },
                  { tag: "#Ethereum", posts: "445K" },
                  { tag: "#Blockchain", posts: "178K" },
                  { tag: "#Layer2", posts: "67K" },
                  { tag: "#DAO", posts: "91K" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between hover:bg-gray-700/30 p-2 rounded-lg transition-colors cursor-pointer">
                    <span className="text-blue-400 hover:text-blue-300 font-medium">{item.tag}</span>
                    <span className="text-xs text-gray-500">{item.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Posts</span>
                  <span className="text-blue-400 font-semibold">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Posts</span>
                  <span className="text-purple-400 font-semibold">
                    {posts.filter(post => post.author === currentAccount).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Likes</span>
                  <span className="text-green-400 font-semibold">
                    {posts.reduce((sum, post) => sum + (post.likes || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            <CreatePost onNewPost={handleNewPost} currentAccount={currentAccount} />

            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Load More Button */}
              <div className="text-center">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed border border-gray-600"
                >
                  {isLoadingMore ? "Loading..." : "Load More Posts"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
