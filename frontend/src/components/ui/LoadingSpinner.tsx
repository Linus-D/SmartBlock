// src/components/ui/LoadingSpinner.tsx
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`animate-spin rounded-full border-t-blue-500 border-b-gray-200 border-gray-200 ${sizeClasses[size]}`}
      />
      {text && <span className="mt-2 text-gray-500">{text}</span>}
    </div>
  );
};
