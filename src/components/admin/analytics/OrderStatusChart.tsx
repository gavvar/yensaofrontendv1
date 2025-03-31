import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
  loading: boolean;
  avgProcessingHours: number;
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
  data,
  loading,
  avgProcessingHours,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">
          Trạng thái đơn hàng
        </h2>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} đơn hàng`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-base font-medium text-gray-700 mb-2">
                  Thời gian xử lý trung bình
                </h3>
                <p className="text-2xl font-bold text-amber-600">
                  {avgProcessingHours.toFixed(1)} giờ
                </p>
                <p className="text-xs text-gray-900 mt-1">
                  Từ lúc đặt hàng đến khi giao hàng thành công
                </p>
              </div>

              <div className="space-y-2">
                {data.map((status, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm text-gray-700">
                        {status.name}:
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {status.value} đơn
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-900">
              Không có dữ liệu trạng thái đơn hàng
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusChart;
