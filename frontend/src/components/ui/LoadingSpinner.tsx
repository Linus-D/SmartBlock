import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Circle, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'minimal' | 'pulse';
  text?: string;
  className?: string;
  inline?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  className = '',
  inline = false,
  color = 'blue'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const colorVariants = {
    blue: {
      primary: 'text-blue-500 border-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600'
    },
    purple: {
      primary: 'text-purple-500 border-purple-500',
      bg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500 to-purple-600'
    },
    green: {
      primary: 'text-green-500 border-green-500',
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      gradient: 'from-green-500 to-green-600'
    },
    orange: {
      primary: 'text-orange-500 border-orange-500',
      bg: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      gradient: 'from-orange-500 to-orange-600'
    },
    pink: {
      primary: 'text-pink-500 border-pink-500',
      bg: 'bg-pink-500/10',
      text: 'text-pink-600 dark:text-pink-400',
      gradient: 'from-pink-500 to-pink-600'
    }
  };

  const colorStyles = colorVariants[color];
  const spinnerSize = sizeClasses[size];
  const textSize = textSizes[size];

  const containerClass = inline
    ? `inline-flex items-center gap-2 ${className}`
    : `flex flex-col items-center justify-center gap-3 ${className}`;

  const SpinnerVariants = {
    primary: () => (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${spinnerSize} relative`}
      >
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-current border-r-current ${colorStyles.primary}`} />
        <div className={`absolute inset-0.5 rounded-full border border-transparent border-t-current opacity-60 ${colorStyles.primary}`} />
      </motion.div>
    ),
    secondary: () => (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className={`${spinnerSize} ${colorStyles.primary}`}
      >
        <Loader2 className="w-full h-full" />
      </motion.div>
    ),
    accent: () => (
      <div className={`${spinnerSize} relative`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 1, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
            className={`absolute inset-0 rounded-full border-2 ${colorStyles.primary} ${i === 1 ? 'scale-75' : i === 2 ? 'scale-50' : ''}`}
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
        <Sparkles className={`absolute inset-0 m-auto w-1/2 h-1/2 ${colorStyles.primary}`} />
      </div>
    ),
    minimal: () => (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`${spinnerSize} ${colorStyles.primary}`}
      >
        <Circle className="w-full h-full stroke-2" />
      </motion.div>
    ),
    pulse: () => (
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`${spinnerSize} rounded-full bg-gradient-to-r ${colorStyles.gradient} shadow-lg`}
      >
        <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 180 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-1/2 h-1/2 text-white" />
          </motion.div>
        </div>
      </motion.div>
    )
  };

  return (
    <div className={containerClass}>
      {/* Spinner Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative ${variant !== 'minimal' && variant !== 'pulse' ? colorStyles.bg + ' rounded-full p-2' : ''}`}
      >
        {SpinnerVariants[variant]()}
      </motion.div>

      {/* Text */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${textSize} ${colorStyles.text} font-medium text-center max-w-xs ${inline ? 'whitespace-nowrap' : ''}`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Loading dots component for inline use
export const LoadingDots: React.FC<{
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
}> = ({
  className = '',
  size = 'md',
  color = 'blue'
}) => {
  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500'
  };

  const dotSize = dotSizes[size];
  const dotColor = colorClasses[color];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className={`${dotSize} ${dotColor} rounded-full`}
        />
      ))}
    </div>
  );
};

// Button loading state component
export const ButtonSpinner: React.FC<{
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}> = ({
  className = '',
  size = 'sm'
}) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} border-transparent border-t-current rounded-full ${className}`}
    />
  );
};

export default LoadingSpinner;
