import React, { useState } from "react";
import { OrderDashboardResponse, OrderSummary } from "@/types/order";
import { OrderDashboardParams, DashboardPeriod } from "@/types/orderFilters";
import { formatAmount, formatNumber, formatDate } from "@/utils/format";
import {
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheck,
  FiXCircle,
  FiRefreshCw,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Đăng ký Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface OrderDashboardProps {
  data: OrderDashboardResponse;
  isLoading: boolean;
  error?: string;
  onPeriodChange: (params: OrderDashboardParams) => void;
  currentPeriod: DashboardPeriod;
  compareWithPrevious?: boolean;
  className?: string;
}

/**
 * Component Dashboard thống kê đơn hàng
 */
const OrderDashboard: React.FC<OrderDashboardProps> = ({
  data,
  isLoading,
  error,
  onPeriodChange,
  currentPeriod,
  compareWithPrevious = false,
  className = "",
}) => {
  const [customRange, setCustomRange] = useState({
    fromDate: "",
    toDate: "",
  });

  // Chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = () => {
    if (!data || !data.dailyOrders) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Lấy labels cho biểu đồ (ngày)
    const labels = data.dailyOrders.map((item) => {
      // Format ngày để hiển thị ngắn gọn
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    // Dataset cho đơn hàng
    const orderCountDataset = {
      label: "Số lượng đơn hàng",
      data: data.dailyOrders.map((item) => item.count),
      borderColor: "rgb(255, 159, 64)",
      backgroundColor: "rgba(255, 159, 64, 0.5)",
    };

    // Dataset cho doanh thu nếu có
    const revenueDataset =
      data.dailyOrders[0]?.revenue !== undefined
        ? {
            label: "Doanh thu (triệu VNĐ)",
            data: data.dailyOrders.map((item) => (item.revenue || 0) / 1000000), // Đổi sang đơn vị triệu
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            yAxisID: "y1",
          }
        : null;

    return {
      labels,
      datasets: revenueDataset
        ? [orderCountDataset, revenueDataset]
        : [orderCountDataset],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ status
  const prepareStatusChartData = () => {
    const { pending, processing, shipped, delivered, cancelled } =
      data?.orderCounts || {};

    return {
      labels: ["Chờ xác nhận", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"],
      datasets: [
        {
          data: [
            pending || 0,
            processing || 0,
            shipped || 0,
            delivered || 0,
            cancelled || 0,
          ],
          backgroundColor: [
            "rgba(150, 150, 150, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderColor: [
            "rgb(150, 150, 150)",
            "rgb(54, 162, 235)",
            "rgb(255, 159, 64)",
            "rgb(75, 192, 192)",
            "rgb(255, 99, 132)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Top products chart
  const prepareTopProductsChart = () => {
    if (!data?.topProducts || data.topProducts.length === 0) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: data.topProducts.map((p) =>
        p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name
      ),
      datasets: [
        {
          label: "Sản phẩm bán chạy",
          data: data.topProducts.map((p) => p.quantity),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (period: DashboardPeriod) => {
    if (period !== "custom") {
      onPeriodChange({ period, compareWithPrevious });
    } else {
      // For custom period, only change if dates are valid
      if (customRange.fromDate && customRange.toDate) {
        onPeriodChange({
          period: "custom",
          fromDate: customRange.fromDate,
          toDate: customRange.toDate,
          compareWithPrevious,
        });
      }
    }
  };

  // Xử lý submit custom date range
  const handleCustomRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRange.fromDate && customRange.toDate) {
      onPeriodChange({
        period: "custom",
        fromDate: customRange.fromDate,
        toDate: customRange.toDate,
        compareWithPrevious,
      });
    }
  };

  // Toggle compare with previous
  const toggleCompare = () => {
    if (currentPeriod === "custom") {
      onPeriodChange({
        period: "custom",
        fromDate: customRange.fromDate,
        toDate: customRange.toDate,
        compareWithPrevious: !compareWithPrevious,
      });
    } else {
      onPeriodChange({
        period: currentPeriod,
        compareWithPrevious: !compareWithPrevious,
      });
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 flex justify-center items-center ${className}`}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-red-500">
          <FiXCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-medium">Đã xảy ra lỗi khi tải dữ liệu</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={() => handlePeriodChange(currentPeriod)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            <FiRefreshCw className="mr-2" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Không có dữ liệu thống kê cho khoảng thời gian này</p>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const statusChartData = prepareStatusChartData();
  const topProductsChartData = prepareTopProductsChart();

  return (
    <div className={`${className}`}>
      {/* Period selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <FiCalendar className="mr-2" />
            Khoảng thời gian
          </h3>

          <div className="flex items-center mt-2 sm:mt-0">
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-amber-600"
                checked={compareWithPrevious}
                onChange={toggleCompare}
              />
              <span className="ml-2 text-sm text-gray-700">
                So sánh với kỳ trước
              </span>
            </label>
            <button
              onClick={() => handlePeriodChange(currentPeriod)}
              className="inline-flex items-center p-1.5 text-gray-500 hover:text-amber-600 rounded-full"
              title="Làm mới dữ liệu"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {["today", "yesterday", "week", "month", "quarter", "year"].map(
            (period) => (
              <button
                key={period}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  currentPeriod === period
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handlePeriodChange(period as DashboardPeriod)}
              >
                {period === "today" && "Hôm nay"}
                {period === "yesterday" && "Hôm qua"}
                {period === "week" && "7 ngày qua"}
                {period === "month" && "30 ngày qua"}
                {period === "quarter" && "Quý này"}
                {period === "year" && "Năm nay"}
              </button>
            )
          )}

          <button
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              currentPeriod === "custom"
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handlePeriodChange("custom")}
          >
            Tùy chỉnh
          </button>
        </div>

        {/* Custom date range */}
        {currentPeriod === "custom" && (
          <form
            onSubmit={handleCustomRangeSubmit}
            className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div>
              <label
                htmlFor="fromDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Từ ngày
              </label>
              <input
                type="date"
                id="fromDate"
                value={customRange.fromDate}
                onChange={(e) =>
                  setCustomRange({ ...customRange, fromDate: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="toDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Đến ngày
              </label>
              <input
                type="date"
                id="toDate"
                value={customRange.toDate}
                onChange={(e) =>
                  setCustomRange({ ...customRange, toDate: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                required
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Áp dụng
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
              <FiShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Tổng đơn hàng
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(data.orderCounts.total)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Total revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Doanh thu
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatAmount(data.totalRevenue)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Pending orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <FiClock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Đơn hàng chờ xử lý
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(
                      data.orderCounts.pending + data.orderCounts.processing
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Delivered orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
              <FiCheck className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Đơn hàng đã giao
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(data.orderCounts.delivered)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Trends */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Xu hướng đơn hàng
          </h3>
          <div className="h-80">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Số đơn hàng",
                    },
                  },
                  y1:
                    data.dailyOrders[0]?.revenue !== undefined
                      ? {
                          beginAtZero: true,
                          position: "right",
                          title: {
                            display: true,
                            text: "Doanh thu (triệu)",
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        }
                      : undefined,
                  x: {
                    title: {
                      display: true,
                      text: "Ngày",
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        if (context.parsed.y !== null) {
                          if (
                            context.dataset.label === "Doanh thu (triệu VNĐ)"
                          ) {
                            label +=
                              (context.parsed.y * 1000000).toLocaleString(
                                "vi-VN"
                              ) + " VNĐ";
                          } else {
                            label += context.parsed.y;
                          }
                        }
                        return label;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Phân bố trạng thái
          </h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const value = context.raw as number;
                        const sum = (
                          context.chart.data.datasets[0].data as number[]
                        ).reduce((a, b) => a + b, 0);
                        const percentage = ((value / sum) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Additional Charts and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Sản phẩm bán chạy
          </h3>
          {data.topProducts && data.topProducts.length > 0 ? (
            <div className="h-80">
              <Bar
                data={topProductsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Số lượng đã bán",
                      },
                    },
                  },
                  indexAxis: "y",
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              Không có dữ liệu sản phẩm
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FiPackage className="mr-2" />
            Đơn hàng gần đây
          </h3>

          {data.recentOrders && data.recentOrders.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {data.recentOrders.map(
                  (
                    order: OrderSummary // Thêm kiểu dữ liệu ở đây
                  ) => (
                    <li key={order.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-600">
                            #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatAmount(
                              order.totalAmount,
                              order.currency || "VND"
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <div>
                          {order.orderStatus === "pending" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <FiClock className="mr-1 h-3 w-3" /> Chờ xác nhận
                            </span>
                          )}
                          {order.orderStatus === "processing" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FiPackage className="mr-1 h-3 w-3" /> Đang xử lý
                            </span>
                          )}
                          {order.orderStatus === "shipped" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <FiTruck className="mr-1 h-3 w-3" /> Đang giao
                            </span>
                          )}
                          {order.orderStatus === "delivered" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheck className="mr-1 h-3 w-3" /> Đã giao
                            </span>
                          )}
                          {order.orderStatus === "cancelled" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FiXCircle className="mr-1 h-3 w-3" /> Đã hủy
                            </span>
                          )}
                        </div>
                        <a
                          href={`/admin/orders/${order.id}`}
                          className="text-xs text-amber-600 hover:text-amber-800"
                        >
                          Xem chi tiết
                        </a>
                      </div>
                    </li>
                  )
                )}
              </ul>

              <div className="mt-4 text-center">
                <a
                  href="/admin/orders"
                  className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
                >
                  Xem tất cả đơn hàng
                  <svg
                    className="ml-1 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a 1 1 0 010 1.414l-4 4a 1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              Không có đơn hàng gần đây
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
