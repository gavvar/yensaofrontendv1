import React, { ReactNode } from "react";
import { FiInfo } from "react-icons/fi";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FiInfo className="h-12 w-12 text-gray-900" />,
  action,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-900 max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
