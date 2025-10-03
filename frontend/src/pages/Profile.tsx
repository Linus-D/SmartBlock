// src/pages/Profile.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import ImageUploadComponent from "../components/ui/ImageUploadComponent";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  Camera,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Edit3,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Star,
  Award,
  TrendingUp,
  X,
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Image upload handlers
  const handleProfileImageUpload = (_file: File, preview: string) => {
    setProfileImage(preview);
    setIsEditingAvatar(false);
  };

  const handleCoverImageUpload = (_file: File, preview: string) => {
    setCoverImage(preview);
    setIsEditingCover(false);
  };

  const handleProfileImageRemove = () => {
    setProfileImage(null);
  };

  const handleCoverImageRemove = () => {
    setCoverImage(null);
  };

  // Initialize loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for Deborah's profile
  const profileData = {
    name: "Deborah",
    username: "@linus",
    bio: "Blockchain enthusiast & DeFi innovator 🚀 Building the future of decentralized finance. Passionate about Web3 technology and digital innovation.",
    location: "Accra, Ghana",
    website: "https://github.com/Linus-D",
    joinDate: "September, 2025",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop",
    followers: "1",
    following: "5",
    posts: "3",
    verified: true,
  };

  const mockPosts = [
    {
      id: 1,
      content:
        "Just deployed a new smart contract for our DeFi protocol! The gas fees were surprisingly low today. Excited to see how the community responds to the new yield farming features 🌾",
      timestamp: "2h",
      likes: 156,
      comments: 23,
      shares: 12,
      images: [
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
      ],
    },
    {
      id: 2,
      content: "All Nations is a great school",
      timestamp: "1d",
      likes: 289,
      comments: 45,
      shares: 67,
    },
  ];

  const achievements = [
    {
      icon: Star,
      title: "Top Contributor",
      description: "Recognized for outstanding contributions",
    },
    {
      icon: Award,
      title: "DeFi Pioneer",
      description: "Early adopter of DeFi protocols",
    },
    {
      icon: TrendingUp,
      title: "Influencer",
      description: "Growing community impact",
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" variant="primary" color="blue" />
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Loading Profile...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fetching your decentralized profile data
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="max-w-4xl mx-auto">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-xl overflow-hidden"
        >
          <img
            src={coverImage || profileData.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20" />

          {/* Edit Cover Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditingCover(true)}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <Camera size={20} />
          </motion.button>
        </motion.div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative -mt-16 mb-4"
          >
            <div className="relative inline-block">
              <img
                src={profileImage || profileData.avatar}
                alt={profileData.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditingAvatar(true)}
                className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-lg"
              >
                <Camera size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profileData.name}
                  </h1>
                  {profileData.verified && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {profileData.username}
                </p>

                <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                  {profileData.bio}
                </p>

                {/* Profile Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon size={16} />
                    <span className="text-blue-500">{profileData.website}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {profileData.joinDate}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900 dark:text-white">
                      {profileData.posts}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900 dark:text-white">
                      {profileData.followers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Followers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900 dark:text-white">
                      {profileData.following}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <MoreHorizontal
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="p-2 bg-yellow-500 text-white rounded-lg"
                    >
                      <Icon size={20} />
                    </motion.div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {["posts", "media", "likes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-center font-medium capitalize transition-all ${
                    activeTab === tab
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "posts" && (
                <div className="space-y-6">
                  {mockPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <img
                          src={profileData.avatar}
                          alt={profileData.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {profileData.name}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {profileData.username}
                            </span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">
                              {post.timestamp}
                            </span>
                          </div>

                          <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                            {post.content}
                          </p>

                          {post.images && (
                            <div className="mb-3">
                              <img
                                src={post.images[0]}
                                alt="Post content"
                                className="w-full max-w-md rounded-lg"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                            <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                              <Heart size={18} />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                              <MessageCircle size={18} />
                              <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                              <Share size={18} />
                              <span>{post.shares}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "media" && (
                <div className="text-center py-12">
                  <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No media posts yet
                  </p>
                </div>
              )}

              {activeTab === "likes" && (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Liked posts will appear here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {isEditingAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Profile Picture
                </h3>
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <ImageUploadComponent
                type="profile"
                onImageUpload={handleProfileImageUpload}
                onImageRemove={handleProfileImageRemove}
                currentImage={profileImage || profileData.avatar}
                className="mb-4"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Upload Modal */}
      <AnimatePresence>
        {isEditingCover && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Cover Photo
                </h3>
                <button
                  onClick={() => setIsEditingCover(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <ImageUploadComponent
                type="post"
                onImageUpload={handleCoverImageUpload}
                onImageRemove={handleCoverImageRemove}
                currentImage={coverImage || profileData.coverImage}
                className="mb-4"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsEditingCover(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
