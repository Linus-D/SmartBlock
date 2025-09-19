// src/routes/PrivateRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useUser } from "../context/UserContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isConnected, isConnecting } = useWeb3();
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  // Show loading while connecting or checking user registration
  if (isConnecting || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to connect page if not connected or not registered
  // In development mode, allow access without wallet connection
  const requiresConnection = import.meta.env.DEV ? false : !isConnected;
  
  if (requiresConnection || !currentUser?.isRegistered) {
    return <Navigate to="/connect" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
