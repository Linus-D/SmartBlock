import React from 'react';
import { motion } from 'framer-motion';
import { Blocks, Zap, Shield, Globe } from 'lucide-react';

interface ModernLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({
  message = "Loading SmartBlock...",
  fullScreen = true
}) => {
  const containerClass = fullScreen
    ? "fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  const icons = [
    { Icon: Blocks, delay: 0, color: "text-blue-400" },
    { Icon: Zap, delay: 0.2, color: "text-yellow-400" },
    { Icon: Shield, delay: 0.4, color: "text-green-400" },
    { Icon: Globe, delay: 0.6, color: "text-purple-400" }
  ];

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Logo and Brand */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-4 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-sm"></div>
              <div className="relative w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                <Blocks className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              SmartBlock
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-gray-300 text-lg mt-2"
            >
              Decentralized Social Network
            </motion.p>
          </div>
        </motion.div>

        {/* Animated Icons */}
        <motion.div
          className="flex justify-center space-x-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {icons.map(({ Icon, delay, color }, index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
              }}
              className={`p-3 rounded-full bg-gray-800/50 backdrop-blur-sm ${color}`}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="w-80 mx-auto mb-6"
        >
          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 h-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-sm"
            />
          </div>
        </motion.div>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-gray-400 text-base"
        >
          {message}
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          className="flex justify-center space-x-1 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot * 0.2
              }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          ))}
        </motion.div>

        {/* Blockchain Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-8"
        >
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  rotateY: [0, 180, 360],
                  backgroundColor: [
                    "rgba(59, 130, 246, 0.3)",
                    "rgba(147, 51, 234, 0.3)",
                    "rgba(236, 72, 153, 0.3)",
                    "rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 border border-blue-400/50 rounded-sm"
              />
            ))}
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-gray-500 mt-2"
          >
            Connecting to Web3...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernLoader;