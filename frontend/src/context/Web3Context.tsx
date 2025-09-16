// src/context/Web3Context.tsx - Debugged version
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";

interface Web3ContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

// Utility functions moved inside or made more robust
const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("No Ethereum provider found. Please install MetaMask.");
};

const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

const switchToSepolia = async () => {
  if (!window.ethereum) throw new Error("No wallet found");

  const sepoliaChainId = "0xaa36a7"; // Sepolia testnet

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: sepoliaChainId }],
    });
  } catch (switchError: any) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: sepoliaChainId,
            chainName: "Sepolia Testnet",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://sepolia.infura.io/v3/"],
            blockExplorerUrls: ["https://sepolia.etherscan.io/"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    console.log("connectWallet called"); // Debug log

    if (!window.ethereum) {
      alert("Please install MetaMask!");
      throw new Error("No Ethereum provider found");
    }

    setIsConnecting(true);
    try {
      console.log("Requesting accounts..."); // Debug log

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      console.log("Getting provider and signer..."); // Debug log

      // Get provider and signer
      const provider = getProvider();
      const signer = await getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      console.log("Connected:", { address, chainId: Number(network.chainId) }); // Debug log

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      console.log("Web3 state updated successfully"); // Debug log
    } catch (error) {
      console.error("Connection failed:", error);
      // Reset state on error
      setProvider(null);
      setSigner(null);
      setAccount(null);
      setChainId(null);
      setIsConnected(false);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    console.log("Disconnecting wallet"); // Debug log
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  };

  const switchNetwork = async () => {
    try {
      await switchToSepolia();
      // Refresh connection after network switch
      if (isConnected) {
        await connectWallet();
      }
    } catch (error) {
      console.error("Network switch failed:", error);
      throw error;
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            console.log("Auto-connecting to existing wallet connection");
            await connectWallet();
          }
        } catch (error) {
          console.error("Failed to check existing connection:", error);
        }
      }
    };

    checkConnection();
  }, []); // Empty dependency array - only run on mount

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          // Account switched, reconnect
          connectWallet().catch(console.error);
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log("Chain changed:", chainId);
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [account]); // Depend on account to avoid stale closures

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnect,
    switchNetwork,
  };

  console.log("Web3Provider rendering with value:", {
    account,
    isConnected,
    isConnecting,
    chainId,
    hasConnectWallet: typeof value.connectWallet === "function",
  }); // Debug log

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
