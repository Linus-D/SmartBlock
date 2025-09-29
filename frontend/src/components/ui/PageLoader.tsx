import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Blocks, Wifi, Users, Zap, Shield, Globe2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  submessage?: string;
  variant?: 'minimal' | 'branded' | 'skeleton';
  progress?: number;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading...",
  submessage,
  variant = 'minimal',
  progress,
  className = ''
}) => {
  if (variant === 'skeleton') {
    return <SkeletonLoader className={className} />;
  }

  if (variant === 'minimal') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
          {submessage && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{submessage}</p>
          )}
        </motion.div>
      </div>
    );
  }

  // Branded variant
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-6"
      >
        {/* Logo Animation */}
        <motion.div
          className="relative mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-16 h-16 mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur-xl" />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="relative w-16 h-16 mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center border border-gray-200 dark:border-gray-700"
          >
            <Blocks className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
        >
          SmartBlock
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          Decentralized Social Network
        </motion.p>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex justify-center gap-4 mb-8"
        >
          {[
            { Icon: Wifi, color: 'text-blue-500', delay: 0 },
            { Icon: Users, color: 'text-green-500', delay: 0.2 },
            { Icon: Shield, color: 'text-purple-500', delay: 0.4 },
            { Icon: Globe2, color: 'text-orange-500', delay: 0.6 }
          ].map(({ Icon, color, delay }, index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
              }}
              className={`p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${color} border border-gray-200 dark:border-gray-700`}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="w-full max-w-xs mx-auto mb-6"
          >
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
              {progress}% complete
            </p>
          </motion.div>
        )}

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="space-y-2"
        >
          <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
          {submessage && (
            <p className="text-sm text-gray-500 dark:text-gray-500">{submessage}</p>
          )}
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex justify-center gap-1 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Skeleton loader for content placeholders
const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-72 animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
              {i === 1 && (
                <div className="mt-4 h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

export default PageLoader;