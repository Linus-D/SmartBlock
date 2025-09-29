import React from 'react';
import { motion } from 'framer-motion';
import { User, UserPlus, Star, TrendingUp } from 'lucide-react';

interface RecommendationCardProps {
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
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  type,
  title,
  subtitle,
  description,
  image,
  metrics,
  onAction,
  actionLabel,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'user':
        return <User size={20} />;
      case 'trending':
        return <TrendingUp size={20} />;
      default:
        return <Star size={20} />;
    }
  };

  const getDefaultAction = () => {
    switch (type) {
      case 'user':
        return 'Follow';
      case 'post':
        return 'View';
      case 'trending':
        return 'Explore';
      default:
        return 'View';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      className={`
        bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4
        hover:bg-gray-100 dark:hover:bg-gray-600/50
        transition-all duration-200 border border-gray-200 dark:border-gray-600
        ${className}
      `}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        {/* Image/Avatar */}
        <div className="flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              {getIcon()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {type === 'trending' && (
              <TrendingUp size={14} className="text-orange-500 flex-shrink-0" />
            )}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
              {description}
            </p>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 overflow-x-auto">
              {metrics.followers !== undefined && (
                <span className="whitespace-nowrap">{metrics.followers.toLocaleString()} followers</span>
              )}
              {metrics.likes !== undefined && (
                <span className="whitespace-nowrap">{metrics.likes.toLocaleString()} likes</span>
              )}
              {metrics.comments !== undefined && (
                <span className="whitespace-nowrap">{metrics.comments.toLocaleString()} comments</span>
              )}
              {metrics.engagement !== undefined && (
                <span className="whitespace-nowrap">{metrics.engagement}% engagement</span>
              )}
            </div>
          )}

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAction}
            className={`
              px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto
              ${type === 'user'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : type === 'trending'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              }
            `}
          >
            {actionLabel || getDefaultAction()}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;