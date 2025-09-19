import React, { useState, useEffect } from "react";
import { Search, Users, TrendingUp, Hash, UserPlus, MessageCircle } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useWeb3 } from "../context/Web3Context";

interface MockUser {
  id: string;
  username: string;
  address: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  avatar: string;
  verified: boolean;
}

interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "CryptoBuilder",
    address: "0x1234567890123456789012345678901234567890",
    bio: "Building the future of DeFi 🚀 Smart contracts & Web3 enthusiast",
    followers: 1240,
    following: 156,
    posts: 89,
    avatar: "CB",
    verified: true
  },
  {
    id: "2",
    username: "NFTArtist",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    bio: "Digital artist creating unique NFT collections ✨",
    followers: 890,
    following: 234,
    posts: 145,
    avatar: "NA",
    verified: false
  },
  {
    id: "3",
    username: "DeFiTrader",
    address: "0x9876543210987654321098765432109876543210",
    bio: "Yield farming specialist | DeFi protocols researcher 📊",
    followers: 2156,
    following: 89,
    posts: 234,
    avatar: "DT",
    verified: true
  },
  {
    id: "4",
    username: "Web3Dev",
    address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    bio: "Full-stack Web3 developer | React + Solidity 💻",
    followers: 1890,
    following: 345,
    posts: 167,
    avatar: "WD",
    verified: true
  },
  {
    id: "5",
    username: "CryptoNewbie",
    address: "0xcafebabecafebabecafebabecafebabecafebabe",
    bio: "New to crypto, learning every day! 🌱 HODL strong",
    followers: 123,
    following: 567,
    posts: 45,
    avatar: "CN",
    verified: false
  }
];

const trendingTopics: TrendingTopic[] = [
  { tag: "#DeFi", posts: "234K", growth: "+12%" },
  { tag: "#NFTs", posts: "156K", growth: "+8%" },
  { tag: "#Ethereum", posts: "445K", growth: "+15%" },
  { tag: "#Web3", posts: "189K", growth: "+22%" },
  { tag: "#Blockchain", posts: "278K", growth: "+5%" },
  { tag: "#DAO", posts: "89K", growth: "+18%" },
  { tag: "#Layer2", posts: "67K", growth: "+31%" }
];

const Explore: React.FC = () => {
  const { account } = useWeb3();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [activeTab, setActiveTab] = useState<"users" | "trending">("users");
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const currentAccount = account || mockAccount;

  useEffect(() => {
    if (searchTerm) {
      const filtered = mockUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(mockUsers);
    }
  }, [searchTerm]);

  const handleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h1 className="text-2xl font-bold text-white mb-4">Explore Web3 Community</h1>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users, topics, or interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === "users"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === "trending"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === "users" ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{user.avatar}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                            {user.verified && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-gray-400 font-mono mb-2">
                            {user.address.slice(0, 6)}...{user.address.slice(-4)}
                          </p>

                          <p className="text-gray-300 mb-3">{user.bio}</p>

                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span><strong className="text-white">{formatNumber(user.followers)}</strong> followers</span>
                            <span><strong className="text-white">{formatNumber(user.following)}</strong> following</span>
                            <span><strong className="text-white">{user.posts}</strong> posts</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFollow(user.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            followedUsers.has(user.id)
                              ? "bg-gray-600 text-white hover:bg-gray-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{followedUsers.has(user.id) ? "Following" : "Follow"}</span>
                        </button>

                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Hash className="w-6 h-6 text-white" />
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-blue-400">{topic.tag}</h3>
                          <p className="text-gray-400">{topic.posts} posts</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-green-400 font-semibold">{topic.growth}</span>
                        <p className="text-xs text-gray-500">24h growth</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Users */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Suggested for You</h3>
              <div className="space-y-4">
                {mockUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{user.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{user.username}</p>
                        <p className="text-xs text-gray-400">{formatNumber(user.followers)} followers</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-blue-400 font-semibold">12.5K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Today</span>
                  <span className="text-green-400 font-semibold">3.2K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New This Week</span>
                  <span className="text-purple-400 font-semibold">456</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
