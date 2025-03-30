import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderStatusInfo,
  PaymentStatusInfo,
} from "@/types/order";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/constants/order";

/**
 * Chuyển đổi trạng thái đơn hàng thành text hiển thị
 * @param status Trạng thái đơn hàng
 */
export const getOrderStatusText = (status: OrderStatus): string => {
  const statusInfo = ORDER_STATUSES.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : status;
};

/**
 * Chuyển đổi trạng thái thanh toán thành text hiển thị
 * @param status Trạng thái thanh toán
 */
export const getPaymentStatusText = (status: PaymentStatus): string => {
  const statusInfo = PAYMENT_STATUSES.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : status;
};

/**
 * Lấy thông tin chi tiết về trạng thái đơn hàng
 * @param status Trạng thái đơn hàng
 */
export const getOrderStatusInfo = (status: OrderStatus): OrderStatusInfo => {
  const statusInfo = ORDER_STATUSES.find((s) => s.value === status);
  if (!statusInfo) {
    return {
      value: status,
      label: status,
      color: "gray",
    };
  }
  return statusInfo;
};

/**
 * Lấy thông tin chi tiết về trạng thái thanh toán
 * @param status Trạng thái thanh toán
 */
export const getPaymentStatusInfo = (
  status: PaymentStatus
): PaymentStatusInfo => {
  const statusInfo = PAYMENT_STATUSES.find((s) => s.value === status);
  if (!statusInfo) {
    return {
      value: status,
      label: status,
      color: "gray",
    };
  }
  return statusInfo;
};

/**
 * Chuyển đổi mã phương thức thanh toán thành text hiển thị
 * @param method Phương thức thanh toán
 */
export const getPaymentMethodText = (method: PaymentMethod): string => {
  // Sửa đoạn này để tìm kiếm trong mảng thay vì truy cập trực tiếp
  const methodInfo = PAYMENT_METHODS.find((m) => m.value === method);
  return methodInfo ? methodInfo.label : String(method);
};

/**
 * Tính tổng giá trị sản phẩm trong đơn hàng
 * @param items Danh sách sản phẩm
 */
export const calculateOrderSubtotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Tính tổng giá trị đơn hàng bao gồm phí ship, thuế, giảm giá
 * @param subtotal Tổng giá trị sản phẩm
 * @param shippingFee Phí vận chuyển
 * @param tax Thuế
 * @param discount Giảm giá
 */
export const calculateOrderTotal = (
  subtotal: number,
  shippingFee: number = 0,
  tax: number = 0,
  discount: number = 0
): number => {
  return subtotal + shippingFee + tax - discount;
};

/**
 * Format ngày giờ thành chuỗi dễ đọc
 * @param dateString Chuỗi ngày giờ
 * @param format Format hiển thị
 */
export const formatOrderDate = (
  dateString: string,
  format: "short" | "long" | "full" = "short"
): string => {
  const date = new Date(dateString);

  // Kiểm tra nếu date không hợp lệ
  if (isNaN(date.getTime())) {
    return dateString;
  }

  try {
    // Format ngày dựa trên loại yêu cầu
    switch (format) {
      case "short":
        return new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);

      case "long":
        return new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);

      case "full":
        return new Intl.DateTimeFormat("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(date);

      default:
        return dateString;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Format số tiền thành chuỗi tiền tệ
 * @param amount Số tiền
 * @param currency Đơn vị tiền tệ
 */
export const formatOrderAmount = (
  amount: number,
  currency: string = "VND"
): string => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return `${amount.toLocaleString()} ${currency}`;
  }
};

/**
 * Kiểm tra xem đơn hàng có thể hủy hay không
 * @param order Đơn hàng cần kiểm tra
 */
export const canCancelOrder = (order: Order): boolean => {
  // Chỉ có thể hủy đơn hàng ở trạng thái 'pending' hoặc 'processing'
  return ["pending", "processing"].includes(order.orderStatus);
};

/**
 * Tạo mã đơn hàng ngẫu nhiên
 */
export const generateOrderNumber = (): string => {
  const prefix = "ORD";
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, "0");

  return `${prefix}-${datePart}-${randomPart}`;
};

/**
 * Lấy trạng thái tiếp theo có thể chuyển đổi
 * @param currentStatus Trạng thái hiện tại
 */
export const getNextPossibleStatuses = (
  currentStatus: OrderStatus
): OrderStatus[] => {
  switch (currentStatus) {
    case "pending":
      return ["processing", "cancelled"];
    case "processing":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered", "cancelled"];
    case "delivered":
      return ["returned"]; // Thêm returned vào đây
    case "cancelled":
      return ["pending"]; // Có thể khôi phục lại thành pending
    case "returned":
      return []; // Trạng thái cuối
    default:
      return [];
  }
};

/**
 * Lấy trạng thái thanh toán tiếp theo có thể chuyển đổi
 * @param currentStatus Trạng thái thanh toán hiện tại
 */
export const getNextPossiblePaymentStatuses = (
  currentStatus: PaymentStatus
): PaymentStatus[] => {
  switch (currentStatus) {
    case "pending":
      return ["paid", "failed"];
    case "paid":
      return ["refunded"];
    case "failed":
      return ["pending", "paid"];
    case "refunded":
      return [];
    default:
      return [];
  }
};

/**
 * Lấy mô tả cho timeline đơn hàng
 * @param status Trạng thái đơn hàng
 */
export const getOrderTimelineDescription = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "Đơn hàng đã được tạo và đang chờ xác nhận";
    case "processing":
      return "Đơn hàng đã được xác nhận và đang được xử lý";
    case "shipped":
      return "Đơn hàng đã được giao cho đơn vị vận chuyển";
    case "delivered":
      return "Đơn hàng đã được giao thành công";
    case "cancelled":
      return "Đơn hàng đã bị hủy";
    case "returned":
      return "Đơn hàng đã được trả lại";
    default:
      return "";
  }
};

export default {
  getOrderStatusText,
  getPaymentStatusText,
  getOrderStatusInfo,
  getPaymentStatusInfo,
  getPaymentMethodText,
  calculateOrderSubtotal,
  calculateOrderTotal,
  formatOrderDate,
  formatOrderAmount,
  canCancelOrder,
  generateOrderNumber,
  getNextPossibleStatuses,
  getNextPossiblePaymentStatuses,
  getOrderTimelineDescription,
};
