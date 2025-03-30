import { useState, useEffect, useCallback } from "react";
import {
  Order,
  OrderNote,
  OrderStatus,
  PaymentStatus,
  OrderHistoryEntry,
} from "@/types/order";
import adminOrderService from "@/services/adminOrderService";
import { toast } from "react-toastify";

interface UseOrderDetailProps {
  orderId: number | string;
  autoLoad?: boolean;
}

// Chỉ định rõ Order có thuộc tính notes
interface OrderWithNotes extends Order {
  notes: OrderNote[];
}

/**
 * Hook quản lý chi tiết đơn hàng và các thao tác xử lý
 */
export function useOrderDetail({
  orderId,
  autoLoad = true,
}: UseOrderDetailProps) {
  // State
  const [order, setOrder] = useState<OrderWithNotes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]); // Sửa kiểu dữ liệu

  // Fetch order detail
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      // Convert orderId to number if it's a string
      const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;

      // Fetch order detail
      const orderData = await adminOrderService.getOrderDetail(id);
      setOrder(orderData);

      // Fetch order history if available
      try {
        const historyData = await adminOrderService.getOrderHistory(id);
        setHistory(historyData);
      } catch (historyError) {
        console.warn("Could not load order history:", historyError);
      }

      return orderData;
    } catch (err: unknown) {
      // Thay any bằng unknown
      console.error("Error fetching order details:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    if (autoLoad && orderId) {
      fetchOrderDetail();
    }
  }, [autoLoad, orderId, fetchOrderDetail]);

  // Update order status
  const updateOrderStatus = useCallback(
    async (newStatus: OrderStatus) => {
      if (!order) return null;

      try {
        setUpdating(true);
        setSubmitSuccess(false);

        const result = await adminOrderService.updateOrderStatus(order.id, {
          orderStatus: newStatus, // Đổi từ status sang orderStatus
        });

        // Update local state
        setOrder((prevOrder) =>
          prevOrder ? { ...prevOrder, orderStatus: newStatus } : null
        );

        // Fetch updated order to get latest data
        await fetchOrderDetail();

        setSubmitSuccess(true);
        toast.success(
          `Trạng thái đơn hàng đã được cập nhật thành ${newStatus}`
        );

        return result;
      } catch (err: unknown) {
        // Thay any bằng unknown
        console.error("Error updating order status:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật trạng thái đơn hàng";
        setError(errorMessage);
        toast.error("Không thể cập nhật trạng thái đơn hàng");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order, fetchOrderDetail]
  );

  // Update payment status
  const updatePaymentStatus = useCallback(
    async (newStatus: PaymentStatus) => {
      if (!order) return null;

      try {
        setUpdating(true);
        setSubmitSuccess(false);

        const result = await adminOrderService.updatePaymentStatus(order.id, {
          status: newStatus,
        });

        // Update local state
        setOrder((prevOrder) =>
          prevOrder ? { ...prevOrder, paymentStatus: newStatus } : null
        );

        // Fetch updated order to get latest data
        await fetchOrderDetail();

        setSubmitSuccess(true);
        toast.success(
          `Trạng thái thanh toán đã được cập nhật thành ${newStatus}`
        );

        return result;
      } catch (err: unknown) {
        // Thay any bằng unknown
        console.error("Error updating payment status:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật trạng thái thanh toán";
        setError(errorMessage);
        toast.error("Không thể cập nhật trạng thái thanh toán");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order, fetchOrderDetail]
  );

  // Update payment info
  const updatePaymentInfo = useCallback(
    async (paymentData: {
      paymentStatus?: PaymentStatus;
      paymentMethod?: string;
      paymentId?: string;
      paidAmount?: number;
      paidAt?: string;
    }) => {
      if (!order) return null;

      try {
        setUpdating(true);
        setSubmitSuccess(false);

        const result = await adminOrderService.updatePaymentInfo(
          order.id,
          paymentData
        );

        // Fetch updated order to get latest data
        await fetchOrderDetail();

        setSubmitSuccess(true);
        toast.success("Thông tin thanh toán đã được cập nhật");

        return result;
      } catch (err: unknown) {
        // Thay any bằng unknown
        console.error("Error updating payment info:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật thông tin thanh toán";
        setError(errorMessage);
        toast.error("Không thể cập nhật thông tin thanh toán");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order, fetchOrderDetail]
  );

  // Add note
  const addNote = useCallback(
    async (noteData: {
      content: string;
      isPrivate: boolean;
      notify?: boolean;
    }) => {
      if (!order) return null;

      try {
        setUpdating(true);

        // Đổi dữ liệu trước khi gửi API
        const result = await adminOrderService.addOrderNote(order.id, {
          note: noteData.content,
          noteType: noteData.isPrivate ? "admin" : "customer",
          isInternal: noteData.isPrivate,
        });

        // Fetch updated order to get latest data with new note
        await fetchOrderDetail();

        toast.success("Ghi chú đã được thêm thành công");

        return result;
      } catch (err: unknown) {
        // Thay any bằng unknown
        console.error("Error adding note:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Không thể thêm ghi chú";
        setError(errorMessage);
        toast.error("Không thể thêm ghi chú");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order, fetchOrderDetail]
  );

  // Delete note
  const deleteNote = useCallback(
    async (noteId: number) => {
      if (!order) return null;

      try {
        setUpdating(true);

        await adminOrderService.deleteOrderNote(order.id, noteId);

        // Update local state
        setOrder((prevOrder) => {
          if (!prevOrder) return null;

          // Sử dụng optional chaining và nullish coalescing
          const filteredNotes =
            prevOrder.notes?.filter((note: OrderNote) => note.id !== noteId) ??
            [];

          return {
            ...prevOrder,
            notes: filteredNotes,
          };
        });

        toast.success("Ghi chú đã được xóa");

        // Fetch updated order
        await fetchOrderDetail();

        return true;
      } catch (err: unknown) {
        // Phần xử lý lỗi không đổi
        console.error("Error deleting note:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Không thể xóa ghi chú";
        setError(errorMessage);
        toast.error("Không thể xóa ghi chú");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order, fetchOrderDetail]
  );

  // Update tracking info
  const updateTrackingInfo = useCallback(
    async (trackingData: {
      trackingNumber: string;
      shippingProvider?: string;
      estimatedDeliveryDate?: string;
    }) => {
      if (!order) return null;

      try {
        setUpdating(true);

        const result = await adminOrderService.updateTrackingInfo(
          order.id,
          trackingData
        );

        // Fetch updated order
        await fetchOrderDetail();

        toast.success("Thông tin vận chuyển đã được cập nhật");

        return result;
      } catch (err: unknown) {
        // Thay any bằng unknown
        console.error("Error updating tracking info:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật thông tin vận chuyển";
        setError(errorMessage);
        toast.error("Không thể cập nhật thông tin vận chuyển");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order, fetchOrderDetail]
  );

  // Print order invoice
  const printOrder = useCallback(async () => {
    if (!order) return null;

    try {
      setUpdating(true);

      const blob = await adminOrderService.printOrder(order.id);

      // Create URL for the blob
      const url = URL.createObjectURL(blob);

      // Open in new window
      const printWindow = window.open(url, "_blank");
      if (!printWindow) {
        toast.warning(
          "Vui lòng cho phép trình duyệt mở cửa sổ pop-up để in hóa đơn"
        );
      }

      return blob;
    } catch (err: unknown) {
      // Thay any bằng unknown
      console.error("Error printing order:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể in hóa đơn";
      setError(errorMessage);
      toast.error("Không thể in hóa đơn");
      return null;
    } finally {
      setUpdating(false);
    }
  }, [order]);

  // Resend order confirmation email
  const resendOrderEmail = useCallback(async () => {
    if (!order) return null;

    try {
      setUpdating(true);

      const result = await adminOrderService.resendOrderEmail(order.id);

      toast.success("Email xác nhận đơn hàng đã được gửi lại thành công");

      return result;
    } catch (err: unknown) {
      // Thay any bằng unknown
      console.error("Error resending order email:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể gửi lại email";
      setError(errorMessage);
      toast.error("Không thể gửi lại email");
      return null;
    } finally {
      setUpdating(false);
    }
  }, [order]);

  // Reset error and success state
  const resetStatus = useCallback(() => {
    setError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    order,
    loading,
    error,
    updating,
    submitSuccess,
    history,
    fetchOrderDetail,
    updateOrderStatus,
    updatePaymentStatus,
    updatePaymentInfo,
    addNote,
    deleteNote,
    updateTrackingInfo,
    printOrder,
    resendOrderEmail,
    resetStatus,
  };
}
