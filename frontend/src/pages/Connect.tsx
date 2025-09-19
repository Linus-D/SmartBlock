// src/pages/Connect.tsx
import React, { useState, useEffect, useRef } from "react";
import { Wallet, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useUser } from "../context/UserContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { validateUsername } from "../lib/utils";
import { useNavigate } from "react-router-dom";

const Connect: React.FC = () => {
  const {
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    switchNetwork,
  } = useWeb3();
  const { currentUser, isLoading: userLoading, registerUser } = useUser();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const targetChainId = parseInt(import.meta.env.VITE_CHAIN_ID || "11155111");
  const isCorrectNetwork = import.meta.env.DEV ? true : chainId === targetChainId;

  // --- Event Handlers ---
  const handleConnectWallet = async () => {
    if (isConnecting) return;

    try {
      await connectWallet();
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === -32002
      ) {
        alert(
          "MetaMask is already processing a request. Please check your extension window to approve or reject the connection."
        );
      } else {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔄 Registration button clicked, username:", username);
    
    if (!validateUsername(username)) {
      console.log("❌ Username validation failed:", username);
      alert(
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
      );
      return;
    }
    
    console.log("✅ Username validation passed, starting registration...");
    setIsRegistering(true);
    
    try {
      console.log("🚀 Calling registerUser function...");
      await registerUser(username);
      console.log("✅ Registration completed, waiting for navigation...");
      hasNavigated.current = true;
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      console.error("❌ Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      console.log("🔄 Setting isRegistering to false");
      setIsRegistering(false);
    }
  };

  // --- Side Effects ---
  useEffect(() => {
    if (hasNavigated.current) return;

    const shouldNavigate =
      !userLoading &&
      currentUser?.isRegistered &&
      (isConnected || import.meta.env.DEV);

    // Reduced logging to prevent console spam
    if (shouldNavigate) {
      console.log("🔍 Navigation triggered - user is registered");
    }

    if (shouldNavigate) {
      console.log("✅ User registered via useEffect, navigating to feed...");
      hasNavigated.current = true;
      // Use a longer delay to prevent rate limiting
      setTimeout(() => {
        navigate("/feed", { replace: true });
      }, 1000);
    }
  }, [isConnected, userLoading, currentUser?.isRegistered]); // Removed navigate to prevent infinite loop

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6">
        <Wallet
          size={48}
          className="mx-auto text-blue-500 dark:text-blue-400"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {import.meta.env.DEV && !isConnected
            ? "Get Started with SmartBlock"
            : "Connect Your Wallet"}
        </h1>

        {userLoading ? (
          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
            <Loader className="animate-spin" size={20} />
            <span>Initializing connection...</span>
          </div>
        ) : !isConnected && !import.meta.env.DEV ? (
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            loading={isConnecting}
            className="w-full"
          >
            Connect Wallet
          </Button>
        ) : (
          <div className="space-y-4">
            {isCorrectNetwork ? (
              <div className="text-green-500 flex items-center justify-center space-x-2">
                <CheckCircle size={20} />
                <span>{import.meta.env.DEV ? "Development Mode" : "Wallet Connected to Sepolia"}</span>
              </div>
            ) : (
              <div className="text-red-500 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle size={20} />
                  <span>Wrong Network</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please switch to the Sepolia testnet.
                </p>
                <Button onClick={switchNetwork} className="w-full">
                  Switch to Sepolia
                </Button>
              </div>
            )}

            {(isCorrectNetwork || import.meta.env.DEV) &&
              !userLoading &&
              currentUser &&
              !currentUser.isRegistered && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {import.meta.env.DEV && !isConnected
                      ? "Welcome to SmartBlock! Choose a username to get started with mock data."
                      : "It looks like you're new here! Choose a username to get started."}
                  </p>
                  <form onSubmit={handleRegisterUser} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      disabled={isRegistering}
                      aria-label="Username input"
                    />
                    <Button
                      type="submit"
                      disabled={!username || isRegistering}
                      loading={isRegistering}
                      className="w-full"
                    >
                      Register
                    </Button>
                  </form>
                </div>
              )}

            {(isCorrectNetwork || import.meta.env.DEV) &&
              !userLoading &&
              currentUser?.isRegistered && (
                <div className="text-green-500 flex items-center justify-center space-x-2">
                  <CheckCircle size={20} />
                  <span>You're all set! Redirecting...</span>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connect;
