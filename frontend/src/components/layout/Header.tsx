import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Wallet,
  Globe,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  Search,
  Bell,
  MessageCircle
} from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

const Header: React.FC = () => {
  const { account, isConnected, chainId, connectWallet, disconnect } = useWeb3();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Mock account for demo mode
  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const displayAccount = account || mockAccount;
  const displayConnected = isConnected || true; // Always show as "connected" in demo mode

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum";
      case 11155111: return "Sepolia";
      case 137: return "Polygon";
      case 56: return "BSC";
      default: return "Unknown";
    }
  };

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 1: return "bg-blue-500";
      case 11155111: return "bg-purple-500";
      case 137: return "bg-purple-600";
      case 56: return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SmartBlock
            </span>
          </Link>

          {/* Navigation */}
          {displayConnected && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Wallet Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* Network Indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-800 rounded-full px-3 py-1.5">
                <div className={`w-2 h-2 rounded-full ${getNetworkColor(chainId || 11155111)}`} />
                <span className="text-sm text-gray-300">
                  {getNetworkName(chainId || 11155111)}
                </span>
              </div>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 rounded-full pl-3 pr-2 py-1.5 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Wallet className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-blue-400'}`} />
                    <span className="text-sm font-mono text-white">
                      {formatAddress(displayAccount)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {isConnected ? "Connected Wallet" : "Demo Account"}
                          </p>
                          <p className="text-xs font-mono text-gray-400">{displayAccount}</p>
                          {!isConnected && (
                            <p className="text-xs text-yellow-400 mt-1">💡 Demo mode</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile/me"
                        className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      {isConnected ? (
                        <button
                          onClick={() => {
                            disconnect();
                            setShowDropdown(false);
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-md"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Disconnect</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            connectWallet();
                            setShowDropdown(false);
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left text-sm text-green-400 hover:bg-gray-700 rounded-md"
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Connect Real Wallet</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {displayConnected && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
