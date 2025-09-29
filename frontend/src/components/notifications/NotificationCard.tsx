import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Bell,
  DollarSign,
  Award,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share' | 'mention' | 'payment' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userAvatar?: string;
  userName?: string;
  postId?: string;
  onMarkAsRead?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  className?: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  read,
  userAvatar,
  userName,
  postId,
  onMarkAsRead,
  onAction,
  className = ''
}) => {
  const getIcon = () => {
    const iconClass = "text-white";
    switch (type) {
      case 'like':
        return <Heart size={16} className={iconClass} />;
      case 'comment':
        return <MessageCircle size={16} className={iconClass} />;
      case 'follow':
        return <UserPlus size={16} className={iconClass} />;
      case 'share':
        return <Share2 size={16} className={iconClass} />;
      case 'payment':
        return <DollarSign size={16} className={iconClass} />;
      case 'achievement':
        return <Award size={16} className={iconClass} />;
      case 'system':
        return <AlertCircle size={16} className={iconClass} />;
      default:
        return <Bell size={16} className={iconClass} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'like':
        return 'bg-red-500';
      case 'comment':
        return 'bg-blue-500';
      case 'follow':
        return 'bg-green-500';
      case 'share':
        return 'bg-purple-500';
      case 'payment':
        return 'bg-yellow-500';
      case 'achievement':
        return 'bg-orange-500';
      case 'system':
        return 'bg-gray-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const handleClick = () => {
    if (!read && onMarkAsRead) {
      onMarkAsRead(id);
    }
    if (onAction) {
      onAction(id, 'view');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`
        p-4 rounded-lg cursor-pointer transition-all duration-200
        ${read
          ? 'bg-white dark:bg-gray-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
        }
        hover:shadow-md border border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`p-2 rounded-full flex-shrink-0 ${getIconBg()}`}>
          {getIcon()}
        </div>

        {/* User Avatar (if applicable) */}
        {userAvatar && (
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`
              font-semibold truncate
              ${read ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'}
            `}>
              {title}
            </h3>
            {!read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
            {message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>

            {(type === 'like' || type === 'comment') && postId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(id, 'viewPost');
                }}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Post
              </motion.button>
            )}

            {type === 'follow' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(id, 'followBack');
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Follow Back
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;