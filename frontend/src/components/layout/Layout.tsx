import React from "react";
import Header from "./Header";
import ThreeJsBackground from "../three/ThreeJsBackground";

interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showBackground = true }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {showBackground && <ThreeJsBackground />}
      <Header />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;