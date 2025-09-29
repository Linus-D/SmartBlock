import { useEffect, useRef } from "react";

// Simple background component that avoids Three.js Image constructor issues
const ThreeJsBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create a simple animated CSS background instead of Three.js for now
    // This avoids the Image constructor issues while maintaining visual appeal

    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{
        background: `
          linear-gradient(45deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.1) 25%,
            rgba(236, 72, 153, 0.1) 50%,
            rgba(59, 130, 246, 0.1) 75%,
            rgba(147, 51, 234, 0.1) 100%
          ),
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent),
          radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3), transparent)
        `,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default ThreeJsBackground;