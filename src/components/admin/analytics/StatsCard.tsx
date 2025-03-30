import React from "react";
import { IconType } from "react-icons";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  color?: string; // bg color for icon
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  loading = false,
  color = "bg-amber-100 text-amber-600",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {loading ? (
              <span className="text-gray-400">Đang tải...</span>
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
