import React from "react";
import { FiLoader } from "react-icons/fi";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`relative inline-flex items-center justify-center ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute left-4">
          <FiLoader className="animate-spin h-5 w-5" />
        </span>
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
      {loading && <span className="absolute">{children}</span>}
    </button>
  );
};

export default LoadingButton;
