import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PaymentMethodData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
  loading: boolean;
}

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({
  data,
  loading,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: PaymentMethodData;
    }>;
    label?: string;
  }

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>Số đơn: {payload[0].payload.value}</p>
          <p>Doanh thu: {formatCurrency(payload[0].payload.amount)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100800">
          Phương thức thanh toán
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
                      `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {data.map((method, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex items-center mb-1">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: method.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100700">
                      {method.name}
                    </span>
                  </div>
                  <div className="flex justify-between px-5">
                    <span className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                      {method.value} đơn hàng
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100800">
                      {formatCurrency(method.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Không có dữ liệu phương thức thanh toán
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsChart;
