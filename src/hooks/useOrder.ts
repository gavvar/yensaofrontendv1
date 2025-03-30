import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Order,
  OrderSummary,
  OrderListParams,
  OrderStatus,
} from "@/types/order";
import orderService from "@/services/orderService";
import { canCancelOrder } from "@/utils/order";
import { useAuth } from "@/contexts/authContext";
//file nay dung de lay thong tin ve don hang
interface UseOrderReturn {
  orders: OrderSummary[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  fetchOrders: (params?: OrderListParams) => Promise<void>;
  fetchOrderById: (orderId: number) => Promise<Order | null>;
  fetchOrderByNumber: (orderNumber: string) => Promise<Order | null>;
  cancelOrder: (orderId: number, reason?: string) => Promise<boolean>;
  trackOrder: (trackingNumber: string) => Promise<Order | null>;
  filterByStatus: (status: OrderStatus | "") => void;
  refreshOrder: () => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useOrder = (): UseOrderReturn => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<OrderListParams>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  /**
   * Fetch list of orders with pagination and filtering
   */
  const fetchOrders = useCallback(
    async (newParams?: OrderListParams) => {
      // Not authenticated, can't fetch orders
      if (!isAuthenticated) {
        router.push("/login?redirect=/orders");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Update params if new ones are provided
        const queryParams = newParams || params;
        if (newParams) {
          setParams(newParams);
        }

        const response = await orderService.getOrders(queryParams);

        setOrders(response.orders);
        setPagination({
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    },
    [isAuthenticated, params, router]
  );

  /**
   * Fetch a specific order by ID
   */
  const fetchOrderById = useCallback(
    async (orderId: number): Promise<Order | null> => {
      try {
        setLoading(true);
        setError(null);

        const order = await orderService.getOrderById(orderId);
        setCurrentOrder(order);
        setLoading(false);

        return order;
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Fetch a specific order by order number
   */
  const fetchOrderByNumber = useCallback(
    async (orderNumber: string): Promise<Order | null> => {
      try {
        setLoading(true);
        setError(null);

        const order = await orderService.getOrderByNumber(orderNumber);
        setCurrentOrder(order);
        setLoading(false);

        return order;
      } catch (err) {
        console.error("Error fetching order by number:", err);
        setError(
          "Không thể tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại."
        );
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Cancel an order
   */
  const cancelOrder = useCallback(
    async (orderId: number, reason?: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // Get the order if we don't have it loaded
        let orderToCancel = currentOrder;
        if (!orderToCancel || orderToCancel.id !== orderId) {
          orderToCancel = await orderService.getOrderById(orderId);
        }

        // Check if the order can be cancelled
        if (!orderToCancel || !canCancelOrder(orderToCancel)) {
          throw new Error("Đơn hàng này không thể hủy.");
        }

        const result = await orderService.cancelOrder(orderId, reason);

        if (result.success) {
          toast.success("Đơn hàng đã được hủy thành công");

          // Refresh order list
          await fetchOrders();

          // If we have the current order loaded, update it
          if (currentOrder && currentOrder.id === orderId) {
            setCurrentOrder({
              ...currentOrder,
              orderStatus: "cancelled",
              cancelReason: reason || "Khách hàng hủy đơn",
              cancelledAt: new Date().toISOString(),
            });
          }

          setLoading(false);
          return true;
        } else {
          throw new Error(result.message || "Không thể hủy đơn hàng");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể hủy đơn hàng. Vui lòng thử lại sau.";
        console.error("Error cancelling order:", err);
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [currentOrder, fetchOrders]
  );

  /**
   * Track an order by tracking number
   */
  const trackOrder = useCallback(
    async (trackingNumber: string): Promise<Order | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await orderService.trackOrderByTrackingNumber(
          trackingNumber
        );

        if (result && result.order) {
          setCurrentOrder(result.order);
          setLoading(false);
          return result.order;
        }

        throw new Error("Không tìm thấy thông tin vận đơn");
      } catch (err) {
        console.error("Error tracking order:", err);
        setError(
          "Không thể tìm thấy thông tin vận đơn. Vui lòng kiểm tra lại mã vận đơn."
        );
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Filter orders by status
   */
  const filterByStatus = useCallback((status: OrderStatus | "") => {
    setParams((prev) => ({
      ...prev,
      orderStatus: status || undefined,
      page: 1, // Reset to first page when filter changes
    }));

    // This will trigger a re-fetch through the useEffect
  }, []);

  /**
   * Refresh the current order
   */
  const refreshOrder = useCallback(async () => {
    if (!currentOrder) return;

    await fetchOrderById(currentOrder.id);
  }, [currentOrder, fetchOrderById]);

  /**
   * Change the current page
   */
  const setCurrentPage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.totalPages) return;

      setParams((prev) => ({
        ...prev,
        page,
      }));

      // This will trigger a re-fetch through the useEffect
    },
    [pagination.totalPages]
  );

  return {
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    fetchOrders,
    fetchOrderById,
    fetchOrderByNumber,
    cancelOrder,
    trackOrder,
    filterByStatus,
    refreshOrder,
    setCurrentPage,
  };
};
