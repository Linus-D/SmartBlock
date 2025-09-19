// frontend/src/lib/web3.ts
import { ethers } from "ethers";

export const getProvider = () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  // Fallback to Sepolia testnet
  return new ethers.JsonRpcProvider(
    import.meta.env.VITE_RPC_URL ||
      "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
  );
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    return await provider.getSigner();
  }
  throw new Error("No wallet connected");
};

export const switchToSepolia = async () => {
  if (!(window as any).ethereum) throw new Error("No wallet found");

  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // Sepolia testnet
    });
  } catch (switchError: any) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
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
