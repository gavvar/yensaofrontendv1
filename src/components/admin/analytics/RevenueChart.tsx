import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts";
import { FiCalendar } from "react-icons/fi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/utils/format";
import { RevenueData } from "@/types/stats";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

// Định nghĩa kiểu cụ thể cho groupBy
type GroupByType = "day" | "week" | "month";

interface RevenueChartProps {
  data: RevenueData[];
  loading: boolean;
  groupBy: GroupByType;
  onGroupByChange: (groupBy: GroupByType) => void;
}

// Định nghĩa type cho dữ liệu chart sau khi đã format
interface ChartDataItem extends RevenueData {
  formattedDate: string;
  totalAmountFormatted: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading,
  groupBy,
  onGroupByChange,
}) => {
  // Format date for display
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: formatDate(item.date, groupBy),
      totalAmountFormatted: formatCurrency(item.totalAmount),
    }));
  }, [data, groupBy]);

  // Hàm format ngày dựa trên groupBy
  function formatDate(dateString: string, groupType: string): string {
    try {
      const date = new Date(dateString);
      switch (groupType) {
        case "day":
          return format(date, "dd/MM/yyyy", { locale: vi });
        case "week":
          return format(date, "'Tuần' w, yyyy", { locale: vi });
        case "month":
          return format(date, "MM/yyyy", { locale: vi });
        default:
          return format(date, "dd/MM/yyyy", { locale: vi });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }

  // Custom tooltip with proper TypeScript typing
  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{data.formattedDate}</p>
          <p className="text-amber-600 font-medium mt-2">
            {formatCurrency(payload[0].value as number)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Doanh thu</h2>
          <p className="text-sm text-gray-900">
            Biểu đồ doanh thu theo thời gian
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => {
                // Ép kiểu để đảm bảo giá trị thuộc GroupByType
                const value = e.target.value as GroupByType;
                onGroupByChange(value);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <FiCalendar className="h-4 w-4 text-gray-900" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tickFormatter={(value) => `${value.toLocaleString()}đ`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="totalAmount"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-900">
          Không có dữ liệu doanh thu trong thời gian này
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
