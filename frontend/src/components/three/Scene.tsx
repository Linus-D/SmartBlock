import React from "react";

interface SceneProps {
  className?: string;
  interactive?: boolean;
  showStars?: boolean;
}

// Simple placeholder 3D scene for now
const FloatingOrb: React.FC<{
  position: [number, number, number];
  color: string;
}> = ({ position, color }) => {
  return (
    <div
      className={`absolute w-4 h-4 rounded-full animate-bounce`}
      style={{
        backgroundColor: color,
        left: `${position[0] * 10 + 50}%`,
        top: `${position[1] * 10 + 50}%`,
        animationDelay: `${position[2]}s`,
      }}
    />
  );
};

// Welcome text component
const WelcomeText: React.FC = () => {
  return (
    <div className="text-center z-10 relative">
      <h1 className="text-6xl font-bold text-blue-600 mb-4 animate-pulse">
        Web3 Social
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
        Decentralized social networking powered by blockchain
      </p>
    </div>
  );
};

export const Scene: React.FC<SceneProps> = ({
  className = "",
  showStars = true,
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        {/* Floating orbs */}
        <FloatingOrb position={[-3, 1, 0]} color="#3b82f6" />
        <FloatingOrb position={[3, -1, 0.5]} color="#8b5cf6" />
        <FloatingOrb position={[0, -2, 1]} color="#06b6d4" />
        <FloatingOrb position={[2, 2, 1.5]} color="#f59e0b" />
        <FloatingOrb position={[-2, -1, 2]} color="#ef4444" />

        {/* Stars effect */}
        {showStars && (
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <WelcomeText />
      </div>
    </div>
  );
};

// Also export as default for flexibility
export default Scene;
