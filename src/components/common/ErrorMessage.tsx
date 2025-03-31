import React from "react";
import { FiAlertCircle } from "react-icons/fi";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = "",
}) => {
  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start ${className}`}
    >
      <FiAlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Đã xảy ra lỗi</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
