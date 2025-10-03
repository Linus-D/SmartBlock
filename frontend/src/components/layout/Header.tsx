import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  Search,
  Bell,
  MessageCircle,
  Menu,
  X,
  Blocks,
  Plus,
} from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

const Header: React.FC = () => {
  const { account, isConnected, chainId, connectWallet, disconnect } =
    useWeb3();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock account for demo mode
  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const displayAccount = account || mockAccount;
  const displayConnected = isConnected || true; // Always show as "connected" in demo mode

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 11155111:
        return "Sepolia";
      case 137:
        return "Polygon";
      case 56:
        return "BSC";
      default:
        return "Unknown";
    }
  };

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "bg-blue-500";
      case 11155111:
        return "bg-purple-500";
      case 137:
        return "bg-purple-600";
      case 56:
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const navItems = [
    { icon: Home, label: "Feed", path: "/feed", badge: 0 },
    { icon: Search, label: "Explore", path: "/explore", badge: 0 },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: 3 },
    { icon: Bell, label: "Notifications", path: "/notifications", badge: 7 },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-gray-200/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Blocks className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SmartBlock
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    Decentralized Network
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Navigation */}
            {displayConnected && (
              <nav className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <div className="relative">
                          <item.icon
                            className={`w-5 h-5 transition-transform duration-200 ${
                              isActive ? "scale-110" : "group-hover:scale-105"
                            }`}
                          />
                          {item.badge > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                            >
                              {item.badge > 9 ? "9+" : item.badge}
                            </motion.span>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl"
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            )}

            {/* Create Post Button (Desktop) */}
            {displayConnected && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Create Post</span>
              </motion.button>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>

              {/* Network Indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl px-3 py-2 backdrop-blur-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${getNetworkColor(
                    chainId || 11155111
                  )}`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {getNetworkName(chainId || 11155111)}
                </span>
              </div>

              {/* Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-xl pl-3 pr-2 py-2 transition-all duration-200 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Wallet
                        className={`w-4 h-4 ${
                          isConnected ? "text-green-500" : "text-blue-500"
                        }`}
                      />
                      {isConnected && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                        />
                      )}
                    </div>
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-200 hidden sm:inline">
                      {formatAddress(displayAccount)}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl backdrop-blur-xl"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            {isConnected && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {isConnected
                                ? "Connected Wallet"
                                : "Demo Account"}
                            </p>
                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                              {displayAccount}
                            </p>
                            {!isConnected && (
                              <div className="flex items-center space-x-1 mt-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                  Demo mode
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <motion.div whileHover={{ x: 4 }}>
                          <Link
                            to="/profile/me"
                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <User className="w-4 h-4" />
                            <span className="font-medium">Profile</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ x: 4 }}>
                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">Settings</span>
                          </Link>
                        </motion.div>
                        <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                        {isConnected ? (
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              disconnect();
                              setShowDropdown(false);
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Disconnect</span>
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              connectWallet();
                              setShowDropdown(false);
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                          >
                            <Wallet className="w-4 h-4" />
                            <span className="font-medium">
                              Connect Real Wallet
                            </span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && displayConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="relative">
                          <item.icon
                            className={`w-5 h-5 ${
                              isActive ? "scale-110" : ""
                            } transition-transform`}
                          />
                          {item.badge > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Create Post Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <button className="flex items-center space-x-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg">
                    <Plus className="w-5 h-5" />
                    <span>Create Post</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Bottom Mobile Navigation (iOS style) */}
      {displayConnected && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around py-2 safe-area-pb">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="relative">
                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    {item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {item.badge > 9 ? "9+" : item.badge}
                      </motion.span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
