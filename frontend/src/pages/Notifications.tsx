import React, { useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  DollarSign,
  TrendingUp,
  Check,
  X,
  Settings,
  Filter
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { useWeb3 } from "../context/Web3Context";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "transaction" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUser?: {
    username: string;
    address: string;
    avatar: string;
  };
  metadata?: {
    postId?: string;
    transactionHash?: string;
    amount?: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    title: "New Like",
    message: "CryptoBuilder liked your post about DeFi yield farming",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    actionUser: {
      username: "CryptoBuilder",
      address: "0x1234567890123456789012345678901234567890",
      avatar: "CB"
    },
    metadata: {
      postId: "post123"
    }
  },
  {
    id: "2",
    type: "follow",
    title: "New Follower",
    message: "NFTArtist started following you",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actionUser: {
      username: "NFTArtist",
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      avatar: "NA"
    }
  },
  {
    id: "3",
    type: "comment",
    title: "New Comment",
    message: "DeFiTrader commented on your post: \"Great analysis! What's your take on the new protocol?\"",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: true,
    actionUser: {
      username: "DeFiTrader",
      address: "0x9876543210987654321098765432109876543210",
      avatar: "DT"
    },
    metadata: {
      postId: "post456"
    }
  },
  {
    id: "4",
    type: "transaction",
    title: "Transaction Confirmed",
    message: "Your post creation transaction has been confirmed on the blockchain",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    metadata: {
      transactionHash: "0xabcd1234...",
      amount: "0.002 ETH"
    }
  },
  {
    id: "5",
    type: "mention",
    title: "You were mentioned",
    message: "Web3Dev mentioned you in a post about smart contract development",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    actionUser: {
      username: "Web3Dev",
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      avatar: "WD"
    },
    metadata: {
      postId: "post789"
    }
  },
  {
    id: "6",
    type: "system",
    title: "Platform Update",
    message: "New feature available: You can now create NFT posts directly on the platform!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true
  },
  {
    id: "7",
    type: "transaction",
    title: "Gas Fee Alert",
    message: "Gas fees are currently low (15 Gwei) - perfect time for transactions!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    read: true,
    metadata: {
      amount: "15 Gwei"
    }
  }
];

const Notifications: React.FC = () => {
  const { account } = useWeb3();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "mentions" | "transactions">("all");

  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const currentAccount = account || mockAccount;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "mention":
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case "transaction":
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case "system":
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.read;
    if (filter === "mentions") return notif.type === "mention";
    if (filter === "transactions") return notif.type === "transaction";
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-400">{unreadCount} unread notifications</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "mentions", label: "Mentions" },
                { key: "transactions", label: "Transactions" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    filter === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                >
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-gray-400">
                {filter === "all"
                  ? "You're all caught up! Check back later for new updates."
                  : `No ${filter} notifications to show.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border transition-colors hover:border-gray-600 ${
                  notification.read ? "border-gray-700" : "border-blue-500/50 bg-blue-500/5"
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Avatar for user actions */}
                  {notification.actionUser && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {notification.actionUser.avatar}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-white">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      {notification.message}
                    </p>

                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="text-xs text-gray-500">
                        {notification.metadata.transactionHash && (
                          <span>Tx: {notification.metadata.transactionHash}</span>
                        )}
                        {notification.metadata.amount && (
                          <span className="text-yellow-400 font-medium">
                            {notification.metadata.amount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {notification.type === "follow" && (
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors">
                            Follow back
                          </button>
                        )}
                        {(notification.type === "like" || notification.type === "comment" || notification.type === "mention") && (
                          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors">
                            View post
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;