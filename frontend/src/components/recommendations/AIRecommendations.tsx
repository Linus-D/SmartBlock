import React from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp } from 'lucide-react';

interface AIRecommendationsProps {
  userInteractions?: Record<string, number>;
  className?: string;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userInteractions = {},
  className = ''
}) => {
  // Simple recommended topics based on user actions
  const getRecommendedTopics = () => {
    const allTopics = ['DeFi', 'NFT', 'Web3', 'Layer2', 'DAO', 'Staking', 'Trading', 'Gaming'];

    // Get user's top interests
    const userTopics = Object.keys(userInteractions).sort((a, b) =>
      (userInteractions[b] || 0) - (userInteractions[a] || 0)
    );

    // Recommend related topics they haven't interacted with much
    const recommended = allTopics.filter(topic =>
      !userTopics.includes(topic) || (userInteractions[topic] || 0) < 2
    ).slice(0, 4);

    return recommended.map(topic => ({
      name: topic,
      reason: userTopics.length > 0 ? 'Based on your activity' : 'Popular topic',
      posts: Math.floor(Math.random() * 3) + 1
    }));
  };

  const recommendations = getRecommendedTopics();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 ${className}`}>
      {/* Simple Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            For You
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Topics you might like
          </p>
        </div>
      </div>

      {/* Simple Recommendations List */}
      <div className="space-y-3">
        {recommendations.map((topic, index) => (
          <motion.div
            key={topic.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer border border-gray-100 dark:border-gray-600"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-blue-600 dark:text-blue-400">#{topic.name}</span>
                <TrendingUp size={12} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {topic.reason}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {topic.posts} posts
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Simple Call to Action */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Interact with posts to get better recommendations
        </p>
      </div>
    </div>
  );
};

export default AIRecommendations;