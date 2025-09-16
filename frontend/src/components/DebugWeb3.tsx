// src/components/DebugWeb3.tsx - Temporary debug component
import React from "react";
import { useWeb3 } from "../context/Web3Context";

export const DebugWeb3: React.FC = () => {
  const web3Context = useWeb3();

  console.log("DebugWeb3 component received context:", web3Context);

  const handleConnect = async () => {
    try {
      console.log(
        "About to call connectWallet, type:",
        typeof web3Context.connectWallet
      );
      await web3Context.connectWallet();
      console.log("connectWallet completed successfully");
    } catch (error) {
      console.error("connectWallet failed:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="font-bold mb-4">Web3 Debug Info</h3>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Account:</strong> {web3Context.account || "Not connected"}
        </p>
        <p>
          <strong>Chain ID:</strong> {web3Context.chainId || "Unknown"}
        </p>
        <p>
          <strong>Is Connected:</strong>{" "}
          {web3Context.isConnected ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is Connecting:</strong>{" "}
          {web3Context.isConnecting ? "Yes" : "No"}
        </p>
        <p>
          <strong>ConnectWallet Type:</strong>{" "}
          {typeof web3Context.connectWallet}
        </p>
        <p>
          <strong>Has Provider:</strong> {web3Context.provider ? "Yes" : "No"}
        </p>
        <p>
          <strong>Has Signer:</strong> {web3Context.signer ? "Yes" : "No"}
        </p>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={handleConnect}
          disabled={web3Context.isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {web3Context.isConnecting ? "Connecting..." : "Test Connect"}
        </button>

        <button
          onClick={web3Context.disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};
