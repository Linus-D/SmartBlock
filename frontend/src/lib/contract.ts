// src/lib/contract.ts
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/contract";

export const getContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "Contract address is not configured. Please set VITE_CONTRACT_ADDRESS in your .env file"
    );
  }

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

export const getContractWithSigner = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("No Ethereum wallet found. Please install MetaMask.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return getContract(signer);
};

export const getContractReadOnly = () => {
  const rpcUrl = import.meta.env.VITE_RPC_URL;

  if (!rpcUrl) {
    console.warn(
      "No RPC URL configured, using default provider. Set VITE_RPC_URL in your .env file for better performance."
    );
    // Fallback to browser provider for read operations
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return getContract(provider);
    } else {
      throw new Error("No RPC URL configured and no browser wallet found");
    }
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return getContract(provider);
};

// Helper function to estimate gas for transactions
export const estimateGas = async (
  contract: ethers.Contract,
  methodName: string,
  params: any[]
) => {
  try {
    const gasEstimate = await contract[methodName].estimateGas(...params);
    // Add 20% buffer to gas estimate
    return (gasEstimate * 120n) / 100n;
  } catch (error) {
    console.error(`Gas estimation failed for ${methodName}:`, error);
    // Return a default gas limit if estimation fails
    return 300000n;
  }
};

// Helper function to wait for transaction confirmation
export const waitForTransaction = async (
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
) => {
  try {
    const receipt = await tx.wait(confirmations);
    if (receipt?.status === 0) {
      throw new Error("Transaction failed");
    }
    return receipt;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};

// Helper function to parse contract events
export const parseContractEvent = (
  receipt: ethers.ContractTransactionReceipt | null,
  eventName: string
) => {
  if (!receipt) return null;

  const contract = getContract(receipt.provider);
  const logs = receipt.logs;

  for (const log of logs) {
    try {
      const parsedLog = contract.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (parsedLog && parsedLog.name === eventName) {
        return parsedLog;
      }
    } catch (error) {
      // Ignore parsing errors for logs from other contracts
    }
  }

  return null;
};
