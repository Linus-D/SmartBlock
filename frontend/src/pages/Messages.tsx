import React, { useState } from "react";
import { Send, Search, Plus, MoreVertical, Phone, Video } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useWeb3 } from "../context/Web3Context";

interface Chat {
  id: string;
  otherUser: {
    username: string;
    address: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  type: "text" | "image" | "file";
}

const mockChats: Chat[] = [
  {
    id: "1",
    otherUser: {
      username: "CryptoBuilder",
      address: "0x1234567890123456789012345678901234567890",
      avatar: "CB",
      online: true
    },
    lastMessage: "Hey! Did you see the new DeFi protocol launch?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unreadCount: 2
  },
  {
    id: "2",
    otherUser: {
      username: "NFTArtist",
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      avatar: "NA",
      online: false
    },
    lastMessage: "I just minted a new NFT collection! 🎨",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 0
  },
  {
    id: "3",
    otherUser: {
      username: "DeFiTrader",
      address: "0x9876543210987654321098765432109876543210",
      avatar: "DT",
      online: true
    },
    lastMessage: "Thanks for the yield farming tip!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 1
  }
];

const mockMessages: { [chatId: string]: Message[] } = {
  "1": [
    {
      id: "1",
      content: "Hey! How's your DeFi journey going?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isOwn: false,
      type: "text"
    },
    {
      id: "2",
      content: "Pretty good! Just discovered a new yield farming strategy",
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      isOwn: true,
      type: "text"
    },
    {
      id: "3",
      content: "That sounds interesting! What's the APY?",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      isOwn: false,
      type: "text"
    },
    {
      id: "4",
      content: "Around 85% APY, but it's on a smaller protocol so higher risk",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isOwn: true,
      type: "text"
    },
    {
      id: "5",
      content: "Hey! Did you see the new DeFi protocol launch?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isOwn: false,
      type: "text"
    }
  ],
  "2": [
    {
      id: "1",
      content: "Love your latest NFT drop! 🔥",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isOwn: true,
      type: "text"
    },
    {
      id: "2",
      content: "Thank you so much! It took weeks to create",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isOwn: false,
      type: "text"
    },
    {
      id: "3",
      content: "I just minted a new NFT collection! 🎨",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isOwn: false,
      type: "text"
    }
  ],
  "3": [
    {
      id: "1",
      content: "Check out this yield farming opportunity",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isOwn: true,
      type: "text"
    },
    {
      id: "2",
      content: "Thanks for the yield farming tip!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isOwn: false,
      type: "text"
    }
  ]
};

export const Messages: React.FC = () => {
  const { account } = useWeb3();
  const [chats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const currentAccount = account || mockAccount;

  const filteredChats = chats.filter(chat =>
    chat.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(mockMessages[chat.id] || []);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      isOwn: true,
      type: "text"
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");

    // Simulate response after a delay
    setTimeout(() => {
      const responses = [
        "That's interesting!",
        "I agree with that approach",
        "Thanks for sharing!",
        "Let me think about it",
        "Good point! 👍"
      ];
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        isOwn: false,
        type: "text"
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1000 + Math.random() * 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar - Chat List */}
        <div className="w-1/3 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-white">Messages</h1>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 cursor-pointer hover:bg-gray-700/50 border-b border-gray-700/50 transition-colors ${
                  selectedChat?.id === chat.id ? "bg-blue-600/20 border-blue-500/50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{chat.otherUser.avatar}</span>
                    </div>
                    {chat.otherUser.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white truncate">{chat.otherUser.username}</p>
                      <p className="text-xs text-gray-400">{formatTime(chat.lastMessageTime)}</p>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                  </div>

                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900/30">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{selectedChat.otherUser.avatar}</span>
                      </div>
                      {selectedChat.otherUser.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{selectedChat.otherUser.username}</p>
                      <p className="text-sm text-gray-400">
                        {selectedChat.otherUser.address.slice(0, 6)}...{selectedChat.otherUser.address.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800/70 text-white border border-gray-700"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Select a conversation</p>
                  <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
