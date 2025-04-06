import React from "react";

interface LoadingProps {
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  message = "Đang tải...",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
        {message}
      </p>
    </div>
  );
};

export default Loading;
