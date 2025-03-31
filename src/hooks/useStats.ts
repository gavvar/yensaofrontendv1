import { useState, useEffect, useCallback } from "react";
import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { toast } from "react-toastify";

// Định nghĩa các kiểu dữ liệu
export type PeriodType = "day" | "week" | "month" | "year" | "quarter";
export type GroupByType = "day" | "week" | "month";

// Interface cho dữ liệu thống kê dashboard
export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  newCustomers: number;
  productsSold: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

// Interface cho trạng thái đơn hàng
export interface OrderStatusStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total: number;
}

// Interface cho phương thức thanh toán
export interface PaymentMethodItem {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

// Interface cho dữ liệu doanh thu
export interface RevenueDataItem {
  date: string;
  value: number;
  totalAmount: number;
  formattedDate?: string; // Thêm trường này vì bạn đang sử dụng nó khi format dữ liệu
}

// Cập nhật interface TopProductItem để phù hợp với TopProduct
export interface TopProductItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  revenue: number;
  image: string;
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    slug: string; // Thêm slug
    thumbnail: string; // Thêm thumbnail
  };
}

// Interface cho trạng thái loading
interface LoadingState {
  dashboard: boolean;
  revenue: boolean;
  topProducts: boolean;
  orderStatus: boolean;
  paymentMethods: boolean;
}

export const useStats = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [revenueData, setRevenueData] = useState<RevenueDataItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [orderStatusStats, setOrderStatusStats] =
    useState<OrderStatusStats | null>(null);
  const [paymentMethodStats, setPaymentMethodStats] = useState<
    PaymentMethodItem[]
  >([]);
  const [loading, setLoading] = useState<LoadingState>({
    dashboard: true,
    revenue: true,
    topProducts: true,
    orderStatus: true,
    paymentMethods: true,
  });
  const [period, setPeriod] = useState<PeriodType>("week");
  const [groupBy, setGroupBy] = useState<GroupByType>("day");

  // Lấy dữ liệu tổng quan dashboard
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        dashboard: true,
      }));
      const response = await apiClient.get(API_ENDPOINTS.STATS.DASHBOARD, {
        params: {
          period,
        },
      });
      setDashboardStats(response.data.data as DashboardStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading((prev) => ({
        ...prev,
        dashboard: false,
      }));
    }
  }, [period]);

  // Format date theo groupBy
  const formatDateByGrouping = (
    dateStr: string,
    grouping: GroupByType
  ): string => {
    const date = new Date(dateStr);
    if (grouping === "day") {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } else if (grouping === "week") {
      return `Tuần ${Math.ceil(date.getDate() / 7)}/${date.getMonth() + 1}`;
    } else {
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  // Lấy dữ liệu doanh thu theo thời gian
  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        revenue: true,
      }));
      const response = await apiClient.get(API_ENDPOINTS.STATS.REVENUE, {
        params: {
          period,
          groupBy,
        },
      });

      // Kiểm tra dữ liệu trả về có đúng định dạng không
      if (response.data && response.data.data) {
        // Kiểm tra nếu data.data là mảng thì mới map
        if (Array.isArray(response.data.data)) {
          // Format dữ liệu thêm trường formattedDate cho biểu đồ
          const formattedData = response.data.data.map(
            (item: RevenueDataItem) => ({
              ...item,
              formattedDate: formatDateByGrouping(item.date, groupBy),
            })
          );
          setRevenueData(formattedData);
        } else {
          // Nếu không phải mảng, ghi log và set mảng rỗng
          console.error("Revenue data is not an array:", response.data.data);
          setRevenueData([]);
          toast.error("Dữ liệu doanh thu không đúng định dạng");
        }
      } else {
        // Nếu không có response.data.data
        console.error("No revenue data found in response");
        setRevenueData([]);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Không thể tải dữ liệu doanh thu");
      setRevenueData([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        revenue: false,
      }));
    }
  }, [period, groupBy]);

  // Lấy dữ liệu top sản phẩm bán chạy
  const fetchTopProducts = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        topProducts: true,
      }));
      const response = await apiClient.get(API_ENDPOINTS.STATS.TOP_PRODUCTS, {
        params: {
          period,
          limit: 5,
        },
      });

      // Kiểm tra dữ liệu
      if (Array.isArray(response.data.data)) {
        setTopProducts(response.data.data as TopProductItem[]);
      } else {
        console.error("Top products data is not an array:", response.data.data);
        setTopProducts([]);
      }
    } catch (error) {
      console.error("Error fetching top products:", error);
      toast.error("Không thể tải dữ liệu sản phẩm bán chạy");
      setTopProducts([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        topProducts: false,
      }));
    }
  }, [period]);

  // Lấy dữ liệu thống kê theo trạng thái đơn hàng
  const fetchOrderStatusStats = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        orderStatus: true,
      }));
      const response = await apiClient.get(API_ENDPOINTS.STATS.ORDER_STATUS, {
        params: {
          period,
        },
      });
      setOrderStatusStats(response.data.data as OrderStatusStats);
    } catch (error) {
      console.error("Error fetching order status stats:", error);
      toast.error("Không thể tải dữ liệu trạng thái đơn hàng");
    } finally {
      setLoading((prev) => ({
        ...prev,
        orderStatus: false,
      }));
    }
  }, [period]);

  // Lấy dữ liệu thống kê theo phương thức thanh toán
  const fetchPaymentMethodStats = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        paymentMethods: true,
      }));
      const response = await apiClient.get(
        API_ENDPOINTS.STATS.PAYMENT_METHODS,
        {
          params: {
            period,
          },
        }
      );

      if (Array.isArray(response.data.data)) {
        setPaymentMethodStats(response.data.data as PaymentMethodItem[]);
      } else {
        console.error("Payment method stats is not an array");
        setPaymentMethodStats([]);
      }
    } catch (error) {
      console.error("Error fetching payment method stats:", error);
      toast.error("Không thể tải dữ liệu phương thức thanh toán");
      setPaymentMethodStats([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        paymentMethods: false,
      }));
    }
  }, [period]);

  // Xuất báo cáo
  const exportRevenueReport = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setLoading((prev) => ({
          ...prev,
          dashboard: true,
        }));
        const response = await apiClient.get(
          API_ENDPOINTS.STATS.EXPORT_REVENUE,
          {
            params: {
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
              format: "xlsx",
            },
            responseType: "blob",
          }
        );

        // Tạo URL và link download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `doanh-thu-${startDate.toISOString().split("T")[0]}-${
            endDate.toISOString().split("T")[0]
          }.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Đã xuất báo cáo thành công");
      } catch (error) {
        console.error("Error exporting revenue report:", error);
        toast.error("Không thể xuất báo cáo");
      } finally {
        setLoading((prev) => ({
          ...prev,
          dashboard: false,
        }));
      }
    },
    []
  );

  // Tải dữ liệu khi component mount hoặc khi period/groupBy thay đổi
  useEffect(() => {
    fetchDashboardStats();
    fetchRevenueData();
    fetchTopProducts();
    fetchOrderStatusStats();
    fetchPaymentMethodStats();
  }, [
    fetchDashboardStats,
    fetchRevenueData,
    fetchTopProducts,
    fetchOrderStatusStats,
    fetchPaymentMethodStats,
  ]);

  return {
    dashboardStats,
    revenueData,
    topProducts,
    orderStatusStats,
    paymentMethodStats,
    loading,
    period,
    setPeriod,
    groupBy,
    setGroupBy,
    exportRevenueReport,
    refresh: {
      fetchDashboardStats,
      fetchRevenueData,
      fetchTopProducts,
      fetchOrderStatusStats,
      fetchPaymentMethodStats,
    },
  };
};

export default useStats;
