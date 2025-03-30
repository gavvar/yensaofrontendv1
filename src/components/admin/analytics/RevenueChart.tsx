import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  date: string;
  revenue: number;
  orderCount: number;
  formattedDate: string;
}

interface RevenueChartProps {
  data: RevenueData[];
  loading: boolean;
  groupBy: "day" | "week" | "month";
  onGroupByChange: (groupBy: "day" | "week" | "month") => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading,
  groupBy,
  onGroupByChange,
}) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-[#4CAF50]">
            Doanh thu: {payload[0].value.toLocaleString("vi-VN")} VNĐ
          </p>
          <p className="text-[#2196F3]">
            Số đơn: {payload[0].payload.orderCount}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Doanh thu theo thời gian
          </h2>

          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => onGroupByChange("day")}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                groupBy === "day"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => onGroupByChange("week")}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                groupBy === "week"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => onGroupByChange("month")}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                groupBy === "month"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tháng
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4CAF50"
                  name="Doanh thu"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">
              Không có dữ liệu cho khoảng thời gian này
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
