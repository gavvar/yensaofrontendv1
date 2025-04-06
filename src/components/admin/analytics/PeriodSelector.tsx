import React from "react";

interface PeriodSelectorProps {
  period: "week" | "month" | "quarter" | "year";
  onChange: (period: "week" | "month" | "quarter" | "year") => void;
  className?: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      <button
        onClick={() => onChange("week")}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          period === "week"
            ? "bg-amber-600 text-white"
            : "bg-white text-gray-900 dark:text-gray-100700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        Tuần
      </button>
      <button
        onClick={() => onChange("month")}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          period === "month"
            ? "bg-amber-600 text-white"
            : "bg-white text-gray-900 dark:text-gray-100700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        Tháng
      </button>
      <button
        onClick={() => onChange("quarter")}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          period === "quarter"
            ? "bg-amber-600 text-white"
            : "bg-white text-gray-900 dark:text-gray-100700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        Quý
      </button>
      <button
        onClick={() => onChange("year")}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          period === "year"
            ? "bg-amber-600 text-white"
            : "bg-white text-gray-900 dark:text-gray-100700 border border-gray-300 hover:bg-gray-50"
        }`}
      >
        Năm
      </button>
    </div>
  );
};

export default PeriodSelector;
