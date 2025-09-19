import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Zap,
  Hash,
  DollarSign,
  Activity,
  Shield,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<any>;
  color: string;
}

const Web3Dashboard: React.FC = () => {
  const { chainId, account, isConnected } = useWeb3();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      // Simulate fetching real-time blockchain data
      const fetchStats = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockStats: DashboardStat[] = [
          {
            id: "gas_price",
            label: "Gas Price",
            value: `${Math.floor(Math.random() * 50 + 20)} Gwei`,
            change: `${(Math.random() * 20 - 10).toFixed(1)}%`,
            trend: Math.random() > 0.5 ? "up" : "down",
            icon: Zap,
            color: "text-yellow-400"
          },
          {
            id: "active_users",
            label: "Active Users",
            value: `${(Math.random() * 10 + 5).toFixed(1)}K`,
            change: `+${Math.floor(Math.random() * 15 + 5)}%`,
            trend: "up",
            icon: Users,
            color: "text-blue-400"
          },
          {
            id: "transactions",
            label: "24h Transactions",
            value: `${Math.floor(Math.random() * 500 + 200)}K`,
            change: `+${Math.floor(Math.random() * 25 + 10)}%`,
            trend: "up",
            icon: TrendingUp,
            color: "text-green-400"
          },
          {
            id: "total_value",
            label: "Total Value Locked",
            value: `$${(Math.random() * 100 + 50).toFixed(1)}M`,
            change: `${(Math.random() * 10 - 5).toFixed(1)}%`,
            trend: Math.random() > 0.3 ? "up" : "down",
            icon: DollarSign,
            color: "text-purple-400"
          },
          {
            id: "block_time",
            label: "Avg Block Time",
            value: `${(Math.random() * 5 + 10).toFixed(1)}s`,
            change: `${(Math.random() * 4 - 2).toFixed(1)}%`,
            trend: Math.random() > 0.5 ? "up" : "down",
            icon: Hash,
            color: "text-orange-400"
          },
          {
            id: "network_health",
            label: "Network Health",
            value: `${Math.floor(Math.random() * 10 + 90)}%`,
            change: `+${(Math.random() * 2).toFixed(1)}%`,
            trend: "up",
            icon: Shield,
            color: "text-emerald-400"
          }
        ];

        setStats(mockStats);
        setLoading(false);
      };

      fetchStats();

      // Refresh data every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      case 137: return "Polygon";
      case 56: return "Binance Smart Chain";
      default: return "Unknown Network";
    }
  };

  // Mock data for demo mode when wallet is not connected
  const mockChainId = 11155111; // Sepolia testnet
  const mockAccount = "0x742d35Cc6635C0532FED36077723295bb9c3DDDD";
  const displayChainId = chainId || mockChainId;
  const displayAccount = account || mockAccount;

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Network Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Network</span>
            <span className="text-white font-medium">{getNetworkName(displayChainId)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Chain ID</span>
            <span className="text-white font-mono">{displayChainId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{isConnected ? "Connected Account" : "Demo Account"}</span>
            <span className="text-white font-mono text-sm">
              {`${displayAccount.slice(0, 6)}...${displayAccount.slice(-4)}`}
            </span>
          </div>
          {!isConnected && (
            <div className="text-xs text-yellow-400 mt-2">
              💡 Running in demo mode with mock data
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Network Analytics</h3>
          <button
            className="text-sm text-gray-400 hover:text-white transition-colors"
            onClick={() => window.location.reload()}
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs ${
                    stat.trend === "up" ? "text-green-400" : "text-red-400"
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-3 rounded-lg transition-colors">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Send Tokens</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 py-3 rounded-lg transition-colors">
            <Hash className="w-4 h-4" />
            <span className="text-sm font-medium">View Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Web3Dashboard;