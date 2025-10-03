import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, TrendingUp, RefreshCw } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Recommendation {
  id: string;
  type: 'user' | 'post' | 'trending';
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  metrics?: {
    likes?: number;
    comments?: number;
    followers?: number;
    engagement?: number;
  };
  score: number;
}

interface RecommendationsListProps {
  userId?: string;
  type?: 'all' | 'users' | 'posts' | 'trending';
  limit?: number;
  className?: string;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({
  userId,
  type = 'all',
  limit = 10,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock data for demonstration
  const mockRecommendations: Recommendation[] = [
    {
      id: '1',
      type: 'user',
      title: 'Alice Johnson',
      subtitle: '@alice_crypto',
      description: 'Blockchain developer and DeFi enthusiast',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      metrics: { followers: 12500, engagement: 4.2 },
      score: 0.92
    },
    {
      id: '2',
      type: 'post',
      title: 'The Future of Decentralized Social Media',
      subtitle: 'by @cryptoblogger',
      description: 'An in-depth analysis of how blockchain technology is revolutionizing social platforms...',
      metrics: { likes: 284, comments: 67 },
      score: 0.89
    },
    {
      id: '3',
      type: 'trending',
      title: '#SmartContracts',
      subtitle: 'Trending topic',
      description: 'Latest discussions about smart contract development and security',
      metrics: { engagement: 8.5 },
      score: 0.87
    },
    {
      id: '4',
      type: 'user',
      title: 'Bob Smith',
      subtitle: '@bob_defi',
      description: 'DeFi protocol architect and Web3 advocate',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      metrics: { followers: 8900, engagement: 3.8 },
      score: 0.85
    }
  ];

  const fetchRecommendations = async () => {
    try {
      setError('');

      // Simulate API call to AI recommendation engine
      await new Promise(resolve => setTimeout(resolve, 1500));

      let filteredRecs = mockRecommendations;

      if (type !== 'all') {
        filteredRecs = mockRecommendations.filter(rec => rec.type === type);
      }

      // Sort by score and limit
      filteredRecs = filteredRecs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      setRecommendations(filteredRecs);
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId, type, limit]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecommendations();
  };

  const handleAction = (recommendation: Recommendation) => {
    console.log('Action clicked for:', recommendation);
    // Implement action logic here
  };

  const getTitle = () => {
    switch (type) {
      case 'users':
        return 'Recommended Users';
      case 'posts':
        return 'Recommended Posts';
      case 'trending':
        return 'Trending Topics';
      default:
        return 'AI Recommendations';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'users':
        return <Users size={20} />;
      case 'trending':
        return <TrendingUp size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center space-y-4 flex-col">
          <LoadingSpinner size="md" />
          <p className="text-gray-600 dark:text-gray-400">
            Generating AI recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw
            size={16}
            className={`${refreshing ? 'animate-spin' : ''} text-gray-600 dark:text-gray-400`}
          />
        </motion.button>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <p className="text-red-500 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      )}

      {/* Recommendations List */}
      {!error && recommendations.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <RecommendationCard
                  {...recommendation}
                  onAction={() => handleAction(recommendation)}
                  className="border-0 shadow-sm"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!error && recommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No recommendations available at the moment
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RecommendationsList;