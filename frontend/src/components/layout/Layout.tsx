import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import ThreeJsBackground from "../three/ThreeJsBackground";
import { ChevronUp } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  variant?: 'default' | 'minimal' | 'centered';
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showBackground = true,
  variant = 'default',
  className = '',
  maxWidth = 'xl'
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-none',
    full: 'w-full'
  };

  const containerClasses = {
    default: `min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 text-gray-900 dark:text-white transition-colors duration-300 ${className}`,
    minimal: `min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 ${className}`,
    centered: `min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300 ${className}`
  };

  if (variant === 'centered') {
    return (
      <div className={containerClasses[variant]}>
        {showBackground && <ThreeJsBackground />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md mx-auto px-6"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={containerClasses[variant]}>
      {showBackground && <ThreeJsBackground />}

      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10"
      >
        {variant === 'minimal' ? (
          <div className="w-full">
            {children}
          </div>
        ) : (
          <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}>
            <div className="py-6 sm:py-8 lg:py-12">
              {children}
            </div>
          </div>
        )}
      </motion.main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background Decorations */}
      {variant === 'default' && (
        <>
          {/* Floating Orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -150, 0],
                y: [0, 100, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/2 -right-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, 120, 0],
                y: [0, -80, 0],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -bottom-10 left-1/3 w-80 h-80 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl"
            />
          </div>

          {/* Grid Pattern */}
          <div className="fixed inset-0 z-0 opacity-[0.02] dark:opacity-[0.05]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
        </>
      )}

      {/* Footer */}
      {variant !== 'centered' && <Footer />}
    </div>
  );
};

export default Layout;