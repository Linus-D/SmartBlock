// src/components/ui/Button.tsx
import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline";
  loading?: boolean;
  as?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
  size = "md",
  variant = "primary",
  loading = false,
  as: Component = "button",
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  return (
    <Component
      className={clsx(
        "inline-flex items-center justify-center rounded font-medium transition",
        sizeClasses[size],
        variantClasses[variant],
        className,
        loading && "opacity-70 cursor-not-allowed"
      )}
      disabled={loading}
      {...props}
    >
      {children}
    </Component>
  );
};
