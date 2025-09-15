// src/pages/Messages.tsx
import React, { useState, useEffect } from "react";
import { Send, Search, Plus } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useContract } from "../hooks/useContract";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import type { UserSearch } from "../components/social/UserSearch";
import type { User } from "../types/user";
import { formatDate, formatAddress } from "../lib/utils";

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  otherUser: {
    address: string;
    username: string;
  };
}

interface Message {
  id: number;
  chatId: string;
  sender: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  isOwn: boolean;
}

export const Messages: React.FC = () => {
  const { account } = useWeb3();
  const { createChat, sendMessage, getUserInfo } = useContract();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (account) {
      loadChats();
    }
  }, [account]);

  const loadChats = async () => {
    // TODO: Implement loading chats from contract
    // This is a placeholder implementation
    setIsLoading(false);
  };

  const loadMessages = async (chatId: string) => {
    // TODO: Implement loading messages from contract
    // This is a placeholder implementation
  };

  const handleStartNewChat = async (user: User) => {
    if (!account) return;

    try {
      await createChat(user.address);
      setIsNewChatModalOpen(false);
      await loadChats(); // Refresh chats
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to start chat");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim() || !account) return;

    setIsSending(true);
    try {
      await sendMessage(selectedChat.id, newMessage.trim());
      setNewMessage("");
      await loadMessages(selectedChat.id); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Messages
            </h1>
            <Button size="sm" onClick={() => setIsNewChatModalOpen(true)}>
              <Plus size={16} />
            </Button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input placeholder="Search messages..." className="pl-10" />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading conversations...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>No conversations yet.</p>
              <Button
                size="sm"
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-2"
              >
                Start a conversation
              </Button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  loadMessages(chat.id);
                }}
                className={`
                  p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700
                  ${
                    selectedChat?.id === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {chat.otherUser.username?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {chat.otherUser.username ||
                          formatAddress(chat.otherUser.address)}
                      </p>
                      {chat.lastMessageTime && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(chat.lastMessageTime)}
                        </p>
                      )}
                    </div>

                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>

                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedChat.otherUser.username
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedChat.otherUser.username || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatAddress(selectedChat.otherUser.address)}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                      ${
                        message.isOwn
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      }
                    `}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`
                        text-xs mt-1
                        ${
                          message.isOwn
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      `}
                    >
                      {formatDate(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  loading={isSending}
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <Send size={32} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-medium">
                  Select a conversation
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start New Conversation"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Search for a user to start a new conversation
          </p>

          <UserSearch
            onUserSelect={handleStartNewChat}
            placeholder="Search for users..."
          />
        </div>
      </Modal>
    </div>
  );
};
