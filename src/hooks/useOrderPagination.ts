import { useState, useEffect, useCallback } from "react";
import { OrderSummary, PaginationData } from "@/types/order";
import {
  OrderFilters,
  AdminOrderFilters,
  OrderStatus,
  PaymentStatus,
  OrderSortField,
} from "@/types/orderFilters";
import adminOrderService from "@/services/adminOrderService";

interface UseOrderPaginationProps {
  initialFilters?: Partial<OrderFilters>;
  autoLoad?: boolean;
}

/**
 * Hook quản lý phân trang và tải dữ liệu đơn hàng
 */
export function useOrderPagination({
  initialFilters = {},
  autoLoad = true,
}: UseOrderPaginationProps = {}) {
  // State
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Tải dữ liệu đơn hàng
  const fetchOrders = useCallback(
    async (filterParams?: Partial<OrderFilters>) => {
      try {
        setIsLoading(true);
        setError(null);

        // Kết hợp filters hiện tại với filterParams mới (nếu có)
        const currentFilters = { ...filters, ...filterParams };

        // Chuyển đổi từ OrderFilters sang AdminOrderFilters
        const adminFilters: AdminOrderFilters = {
          page: currentFilters.page,
          limit: currentFilters.limit,
          sortBy: currentFilters.sortBy as OrderSortField,
          sortOrder: currentFilters.sortOrder,
          search: currentFilters.search,
          // Chuyển đổi thành OrderStatus đúng kiểu
          orderStatus: Array.isArray(currentFilters.orderStatus)
            ? (currentFilters.orderStatus as OrderStatus[])
            : (currentFilters.orderStatus as OrderStatus | undefined),
          // Chuyển đổi thành PaymentStatus đúng kiểu
          paymentStatus: Array.isArray(currentFilters.paymentStatus)
            ? (currentFilters.paymentStatus as PaymentStatus[])
            : (currentFilters.paymentStatus as PaymentStatus | undefined),
          fromDate: currentFilters.fromDate,
          toDate: currentFilters.toDate,
          minAmount: currentFilters.minAmount,
          maxAmount: currentFilters.maxAmount,
          customerId: currentFilters.customerId,
        };

        // Gọi API để lấy dữ liệu
        const response = await adminOrderService.getOrders(adminFilters);

        // Xử lý dữ liệu trước khi cập nhật state
        const orderSummaries: OrderSummary[] = response.orders.map((order) => {
          // Tính tổng số lượng sản phẩm
          const itemCount =
            order.items?.reduce(
              (total, item) => total + (item.quantity || 1),
              0
            ) || 0;

          // Tạo OrderSummary từ Order
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderStatus: order.status, // Chuyển status sang orderStatus
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            orderDate: order.createdAt, // Chuyển createdAt sang orderDate
            customerName: order.customerName || "",
            email: order.customerEmail || "",
            phone: order.customerPhone || "",
            itemCount: itemCount, // Thêm thuộc tính này
            currency: order.currency || "VND", // Thêm currency nếu cần
            items:
              order.items?.map((item) => ({
                count: item.quantity || 1,
                productId: item.productId,
                productName: item.productName,
                price: item.price,
              })) || [],
          };
        });

        // Cập nhật dữ liệu và phân trang
        setOrders(orderSummaries);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });

        // Cập nhật filters nếu có thay đổi
        if (filterParams) {
          setFilters(currentFilters);
        }

        return response;
      } catch (err: unknown) {
        // Xử lý lỗi
        console.error("Error fetching orders:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách đơn hàng";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // Tải dữ liệu lần đầu
  useEffect(() => {
    if (autoLoad) {
      fetchOrders();
    }
  }, [autoLoad, fetchOrders]);

  // Chuyển trang
  const goToPage = useCallback(
    (page: number) => {
      if (page !== filters.page) {
        fetchOrders({ page });
      }
    },
    [fetchOrders, filters.page]
  );

  // Thay đổi số lượng item trên mỗi trang
  //   const changeLimit = useCallback(
  //     (limit: number) => {
  //       if (limit !== filters.limit) {
  //         fetchOrders({ limit, page: 1 });
  //       }
  //     },
  //     [fetchOrders, filters.limit]
  //   );

  // Thay đổi cách sắp xếp
  const changeSort = useCallback(
    (sortBy: OrderSortField, sortOrder: "asc" | "desc") => {
      fetchOrders({ sortBy, sortOrder, page: 1 });
    },
    [fetchOrders]
  );

  // Áp dụng bộ lọc mới
  //   const applyFilters = useCallback(
  //     (newFilters: Partial<OrderFilters>) => {
  //       fetchOrders({ ...newFilters, page: 1 });
  //     },
  //     [fetchOrders]
  //   );

  // Làm mới dữ liệu
  const refresh = useCallback(() => {
    return fetchOrders();
  }, [fetchOrders]);

  // Xử lý chọn tất cả các đơn hàng
  const selectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        // Chọn tất cả đơn hàng trên trang hiện tại
        setSelectedIds(orders.map((order) => order.id));
      } else {
        // Bỏ chọn tất cả
        setSelectedIds([]);
      }
    },
    [orders]
  );

  // Xử lý chọn một đơn hàng
  const toggleSelect = useCallback((orderId: number, selected: boolean) => {
    setSelectedIds((prev) => {
      if (selected) {
        // Thêm id vào danh sách
        if (!prev.includes(orderId)) {
          return [...prev, orderId];
        }
      } else {
        // Loại bỏ id khỏi danh sách
        return prev.filter((id) => id !== orderId);
      }
      return prev;
    });
  }, []);

  // Xử lý hàng loạt đơn hàng
  const bulkAction = useCallback(
    async (
      action: "delete" | "restore" | "export",
      ids: number[] = selectedIds
    ) => {
      if (!ids.length) return null;

      try {
        setIsLoading(true);
        let result = null;

        switch (action) {
          case "delete":
            result = await adminOrderService.bulkDeleteOrders(ids);
            break;
          case "restore":
            result = await adminOrderService.bulkRestoreOrders(ids);
            break;
          case "export":
            result = await adminOrderService.exportOrders({ orderIds: ids });
            break;
          default:
            throw new Error("Hành động không hợp lệ");
        }

        // Nếu thành công và đây là hành động delete hoặc restore, thì làm mới dữ liệu
        if (["delete", "restore"].includes(action)) {
          await refresh();
          // Reset selected ids
          setSelectedIds([]);
        }

        return result;
      } catch (err: unknown) {
        // Thay any bằng unknown
        console.error(`Error performing bulk action ${action}:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : `Không thể thực hiện hành động ${action}`;
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedIds, refresh]
  );

  // Thêm phương thức updateFilters vào return object
  return {
    orders,
    pagination,
    filters,
    isLoading,
    error,
    selectedIds,
    refresh,
    goToPage,
    changeSort,
    toggleSelect,
    selectAll,
    bulkAction,
    // Thêm phương thức mới để cập nhật filter
    updateFilters: useCallback(
      (newFilters: Partial<OrderFilters>) => {
        fetchOrders({ ...newFilters, page: 1 }); // Reset về trang 1 khi thay đổi filter
      },
      [fetchOrders]
    ),
  };
}
