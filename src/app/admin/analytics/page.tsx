"use client";

import { useState, useEffect, useMemo } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import adminService from "@/services/adminService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiDownload,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Chart components
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Type definitions
type PeriodType = "week" | "month" | "quarter" | "year";
type GroupByType = "day" | "week" | "month";

interface DashboardStats {
  revenue: number;
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  newCustomers: number;
  productsSold: number;
  period: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  orderCount: number;
}

interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  product: {
    name: string;
    slug: string;
    thumbnail: string;
  };
}

interface PaymentMethodStat {
  paymentMethod: string;
  orderCount: number;
  totalAmount: number;
}

interface OrderStatusStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// Color constants
const COLORS = {
  revenue: "#4CAF50",
  orders: "#2196F3",
  products: "#FF9800",
  customers: "#9C27B0",

  pending: "#FFC107",
  processing: "#2196F3",
  shipped: "#03A9F4",
  delivered: "#4CAF50",
  cancelled: "#F44336",

  cod: "#607D8B",
  vnpay: "#3F51B5",
  momo: "#E91E63",
  bank_transfer: "#795548",
};

const PAYMENT_METHOD_NAMES = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "Thanh toán VNPAY",
  MOMO: "Ví MoMo",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

export default function AdminAnalyticsPage() {
  const { isAuthorized, loading: authLoading } = useRequireAuth(
    "/login",
    "admin"
  );

  // State cho filter
  const [period, setPeriod] = useState<PeriodType>("month");
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [groupBy, setGroupBy] = useState<GroupByType>("day");

  // State cho data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStat[]>([]);
  const [orderStatusStats, setOrderStatusStats] =
    useState<OrderStatusStats | null>(null);
  const [avgProcessingHours, setAvgProcessingHours] = useState<number>(0);

  // Loading states
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState(true);

  // Formatted date strings for API calls
  const formattedStartDate = useMemo(
    () => format(startDate, "yyyy-MM-dd"),
    [startDate]
  );

  const formattedEndDate = useMemo(
    () => format(endDate, "yyyy-MM-dd"),
    [endDate]
  );

  // Effect to fetch dashboard data when period changes
  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardStats();
      fetchTopProducts();
      fetchPaymentMethodStats();
    }
  }, [isAuthorized, period]);

  // Effect to fetch revenue data when date range or groupBy changes
  useEffect(() => {
    if (isAuthorized) {
      fetchRevenueData();
    }
  }, [isAuthorized, formattedStartDate, formattedEndDate, groupBy]);

  // Effect to fetch order status stats
  useEffect(() => {
    if (isAuthorized) {
      fetchOrderStatusStats();
    }
  }, [isAuthorized]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoadingDashboard(true);
      const response = await adminService.getStats(
        `/stats/dashboard?period=${period}`
      );
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch revenue data
  const fetchRevenueData = async () => {
    try {
      setLoadingRevenue(true);
      const response = await adminService.getStats(
        `/stats/revenue?startDate=${formattedStartDate}&endDate=${formattedEndDate}&groupBy=${groupBy}`
      );
      setRevenueData(response.data.revenueByTime);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoadingRevenue(false);
    }
  };

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await adminService.getStats(
        `/stats/top-products?limit=5&period=${period}`
      );
      setTopProducts(response.data.topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch payment method stats
  const fetchPaymentMethodStats = async () => {
    try {
      setLoadingPayments(true);
      const response = await adminService.getStats(
        `/stats/payment-methods?period=${period}`
      );
      setPaymentStats(response.data.paymentStats);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      setPaymentStats([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Fetch order status stats
  const fetchOrderStatusStats = async () => {
    try {
      setLoadingOrderStatus(true);
      const response = await adminService.getStats(`/stats/order-status`);
      setOrderStatusStats(response.data.orderStatusStats);
      setAvgProcessingHours(response.data.avgProcessingHours);
    } catch (error) {
      console.error("Error fetching order status stats:", error);
    } finally {
      setLoadingOrderStatus(false);
    }
  };

  // Export revenue report
  const exportRevenueReport = async () => {
    try {
      const response = await adminService.getStats(
        `/stats/export/revenue?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      // Hiển thị thông báo thành công và tải file về nếu cần
      alert(
        `Xuất báo cáo thành công!\nTổng đơn hàng: ${
          response.data.totalOrders
        }\nTổng doanh thu: ${response.data.totalRevenue.toLocaleString(
          "vi-VN"
        )} VNĐ`
      );
    } catch (error) {
      console.error("Error exporting revenue report:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo.");
    }
  };

  // Format data for order status pie chart
  const orderStatusChartData = useMemo(() => {
    if (!orderStatusStats) return [];

    return [
      {
        name: "Chờ xác nhận",
        value: orderStatusStats.pending,
        color: COLORS.pending,
      },
      {
        name: "Đang xử lý",
        value: orderStatusStats.processing,
        color: COLORS.processing,
      },
      {
        name: "Đang giao",
        value: orderStatusStats.shipped,
        color: COLORS.shipped,
      },
      {
        name: "Đã giao",
        value: orderStatusStats.delivered,
        color: COLORS.delivered,
      },
      {
        name: "Đã hủy",
        value: orderStatusStats.cancelled,
        color: COLORS.cancelled,
      },
    ];
  }, [orderStatusStats]);

  // Format data for payment method pie chart
  const paymentMethodChartData = useMemo(() => {
    return paymentStats.map((stat) => ({
      name:
        PAYMENT_METHOD_NAMES[
          stat.paymentMethod as keyof typeof PAYMENT_METHOD_NAMES
        ] || stat.paymentMethod,
      value: stat.orderCount,
      amount: stat.totalAmount,
      color:
        stat.paymentMethod === "COD"
          ? COLORS.cod
          : stat.paymentMethod === "VNPAY"
          ? COLORS.vnpay
          : stat.paymentMethod === "MOMO"
          ? COLORS.momo
          : COLORS.bank_transfer,
    }));
  }, [paymentStats]);

  // Format revenue data for chart
  const formattedRevenueData = useMemo(() => {
    return revenueData.map((item) => ({
      ...item,
      formattedDate: format(
        new Date(item.date),
        groupBy === "day"
          ? "dd/MM"
          : groupBy === "week"
          ? "'Tuần' w"
          : "MM/yyyy",
        { locale: vi }
      ),
    }));
  }, [revenueData, groupBy]);

  // Custom tooltip for revenue chart
  interface RevenueTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        formattedDate: string;
        revenue: number;
        orderCount: number;
      };
    }>;
    label?: string;
  }

  const RevenueTooltip = ({ active, payload }: RevenueTooltipProps) => {
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

  // Payment method tooltip
  interface PaymentTooltipProps {
    active?: boolean;
    payload?: {
      payload: {
        name: string;
        value: number;
        amount: number;
      };
    }[];
  }

  const PaymentTooltip = ({ active, payload }: PaymentTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>Số đơn: {payload[0].payload.value}</p>
          <p>
            Doanh thu: {payload[0].payload.amount.toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
      );
    }
    return null;
  };

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Loading screen
  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Phân tích thống kê
        </h1>
        <p className="text-gray-900">
          Xem thống kê chi tiết về hoạt động kinh doanh của cửa hàng
        </p>
      </div>

      {/* Period selector */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="font-medium text-gray-700">Khoảng thời gian:</div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === "week"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === "month"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => setPeriod("quarter")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === "quarter"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Quý
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === "year"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Doanh thu */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loadingDashboard ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  formatCurrency(dashboardStats?.revenue || 0)
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiDollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loadingDashboard ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  dashboardStats?.totalOrders || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Sản phẩm đã bán */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 text-sm">Sản phẩm đã bán</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loadingDashboard ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  dashboardStats?.productsSold || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <FiPackage className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Khách hàng mới */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900 text-sm">Khách hàng mới</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loadingDashboard ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  dashboardStats?.newCustomers || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiUsers className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Doanh thu theo thời gian
            </h2>

            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => setGroupBy("day")}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  groupBy === "day"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => setGroupBy("week")}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  groupBy === "week"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setGroupBy("month")}
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

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900">Từ ngày:</span>
              <DatePicker
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-32"
                dateFormat="dd/MM/yyyy"
                maxDate={endDate}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900">Đến ngày:</span>
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => setEndDate(date)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-32"
                dateFormat="dd/MM/yyyy"
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {loadingRevenue ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : formattedRevenueData.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedRevenueData}
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
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.revenue}
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
              <p className="text-gray-900">
                Không có dữ liệu cho khoảng thời gian này
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Status and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Order Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Trạng thái đơn hàng
            </h2>
          </div>

          <div className="p-6">
            {loadingOrderStatus ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : orderStatusStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusChartData}
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
                        {orderStatusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} đơn hàng`, ""]}
                      />
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
                    {orderStatusChartData.map((status, index) => (
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

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Phương thức thanh toán
            </h2>
          </div>

          <div className="p-6">
            {loadingPayments ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : paymentStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name.split(" ")[0]}: ${(percent * 100).toFixed(
                            0
                          )}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PaymentTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {paymentMethodChartData.map((method, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div className="flex items-center mb-1">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: method.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {method.name}
                        </span>
                      </div>
                      <div className="flex justify-between px-5">
                        <span className="text-sm text-gray-900">
                          {method.value} đơn hàng
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {formatCurrency(method.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-900">
                  Không có dữ liệu phương thức thanh toán
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Top sản phẩm bán chạy
          </h2>
        </div>

        <div className="p-6">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Sản phẩm
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Đã bán
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.productId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                            {product.product?.thumbnail && (
                              <img
                                src={`/api/images/${product.product.thumbnail}`}
                                alt={product.productName}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/placeholder.png";
                                }}
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-900">
                              ID: {product.productId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {product.totalSold} sản phẩm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-20">
              <p className="text-gray-900">
                Không có dữ liệu sản phẩm bán chạy
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Export Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Xuất báo cáo doanh thu
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-900 mb-4">
                Chọn khoảng thời gian để xuất báo cáo doanh thu chi tiết
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm text-gray-700 w-20">Từ ngày:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                    dateFormat="dd/MM/yyyy"
                    maxDate={endDate}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm text-gray-700 w-20">
                    Đến ngày:
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date) => setEndDate(date)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                    dateFormat="dd/MM/yyyy"
                    minDate={startDate}
                    maxDate={new Date()}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm text-gray-700 w-20">
                    Định dạng:
                  </label>
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                    <option value="pdf">PDF (.pdf)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={exportRevenueReport}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto"
              >
                <FiDownload className="mr-2" /> Xuất báo cáo
              </button>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-800 mb-3">
                Thông tin tổng quan báo cáo
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">
                    Khoảng thời gian:
                  </span>
                  <span className="text-sm font-medium">
                    {format(startDate, "dd/MM/yyyy")} -{" "}
                    {format(endDate, "dd/MM/yyyy")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">
                    Tổng số đơn hàng:
                  </span>
                  <span className="text-sm font-medium">
                    {dashboardStats?.totalOrders || "..."}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">Tổng doanh thu:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(dashboardStats?.revenue || 0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">
                    Đơn giá trung bình:
                  </span>
                  <span className="text-sm font-medium">
                    {dashboardStats?.totalOrders
                      ? formatCurrency(
                          (dashboardStats.revenue || 0) /
                            dashboardStats.totalOrders
                        )
                      : "..."}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-900">
                * Báo cáo sẽ bao gồm chi tiết về đơn hàng, sản phẩm, doanh thu
                theo ngày và thông tin thanh toán.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
