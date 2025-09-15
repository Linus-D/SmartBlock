// src/pages/Connect.tsx
import React, { useState, useEffect } from "react"; // Import useEffect
import { Wallet, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useUser } from "../context/UserContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { validateUsername } from "../lib/utils";
import { useNavigate } from "react-router-dom";

const Connect: React.FC = () => {
  const {
    account, // account is not currently used in the JSX, but good to have
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    switchNetwork,
  } = useWeb3();
  const { currentUser, isLoading: userLoading, registerUser } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  // showUsernameForm state is managed internally by the conditions below,
  // so it might not be strictly necessary to manage it as a separate state
  // unless you have more complex UI transitions. For now, we'll rely on
  // the conditions for rendering.

  // Get targetChainId from environment variables, default to Sepolia if not set
  const targetChainId = parseInt(import.meta.env.VITE_CHAIN_ID || "11155111");
  const isCorrectNetwork = chainId === targetChainId;

  // --- Event Handlers ---
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      // You might want to show a user-facing error message here too
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      alert(
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
      );
      return;
    }
    setIsRegistering(true);
    try {
      await registerUser(username);
      // The navigation will be handled by the useEffect below once currentUser.isRegistered is true
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  // --- Side Effects ---
  // Redirect if user is already connected and registered, or if registration is complete
  useEffect(() => {
    if (isConnected && !userLoading && currentUser?.isRegistered) {
      navigate("/feed");
    }
    // If user is connected, not loading, and has just registered (indicated by username state and registration success)
    // The registerUser function should ideally return success or update state that currentUser.isRegistered becomes true.
    // We rely on currentUser.isRegistered becoming true after a successful registerUser call.
  }, [isConnected, userLoading, currentUser?.isRegistered, navigate]); // Depend on these values

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6">
        <Wallet
          size={48}
          className="mx-auto text-blue-500 dark:text-blue-400"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Connect Your Wallet
        </h1>

        {userLoading ? (
          // Loading state for user data
          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
            <Loader className="animate-spin" size={20} />
            <span>Initializing connection...</span>
          </div>
        ) : !isConnected ? (
          // State: Wallet not connected
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            loading={isConnecting}
            className="w-full"
          >
            Connect Wallet
          </Button>
        ) : (
          // State: Wallet is connected
          <div className="space-y-4">
            {isCorrectNetwork ? (
              // State: Wallet connected to the correct network
              <div className="text-green-500 flex items-center justify-center space-x-2">
                <CheckCircle size={20} />
                <span>Wallet Connected to Sepolia</span>
              </div>
            ) : (
              // State: Wallet connected but on the wrong network
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

            {/* Show username form if connected to correct network and user is not registered */}
            {isCorrectNetwork &&
              !userLoading &&
              currentUser &&
              !currentUser.isRegistered && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    It looks like you're new here! Choose a username to get
                    started.
                  </p>
                  <form onSubmit={handleRegisterUser} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isRegistering}
                      aria-label="Username input"
                    />
                    <Button
                      type="submit"
                      disabled={!username || isRegistering} // Disable if username is empty or registering
                      loading={isRegistering}
                      className="w-full"
                    >
                      Register
                    </Button>
                  </form>
                </div>
              )}

            {/* Message if user is connected, on correct network, and already registered */}
            {isCorrectNetwork && !userLoading && currentUser?.isRegistered && (
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
