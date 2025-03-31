import { OrderStatusStats, PaymentMethodStat } from "@/types/stats";

// Ánh xạ trạng thái đơn hàng sang màu sắc
export const mapOrderStatusToColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#3B82F6"; // blue-500
    case "processing":
      return "#F59E0B"; // amber-500
    case "shipped":
      return "#8B5CF6"; // purple-500
    case "delivered":
      return "#10B981"; // emerald-500
    case "cancelled":
      return "#EF4444"; // red-500
    default:
      return "#9CA3AF"; // gray-400
  }
};

// Ánh xạ phương thức thanh toán sang tên hiển thị đẹp
export const mapPaymentMethodToLabel = (method: string): string => {
  switch (method.toLowerCase()) {
    case "cod":
      return "Thanh toán khi nhận hàng";
    case "bank_transfer":
      return "Chuyển khoản";
    case "vnpay":
      return "VN Pay";
    case "momo":
      return "Ví MoMo";
    case "zalopay":
      return "ZaloPay";
    case "card":
      return "Thẻ tín dụng/ghi nợ";
    default:
      return method;
  }
};

// Ánh xạ phương thức thanh toán sang màu sắc
export const mapPaymentMethodToColor = (method: string): string => {
  switch (method.toLowerCase()) {
    case "cod":
      return "#10B981"; // emerald-500
    case "bank_transfer":
      return "#3B82F6"; // blue-500
    case "vnpay":
      return "#8B5CF6"; // purple-500
    case "momo":
      return "#EC4899"; // pink-500
    case "zalopay":
      return "#0EA5E9"; // sky-500
    case "card":
      return "#F59E0B"; // amber-500
    default:
      return "#9CA3AF"; // gray-400
  }
};

// Chuyển đổi OrderStatusStats từ API sang định dạng hiển thị cho biểu đồ
export const adaptOrderStatusForChart = (
  data: OrderStatusStats | null
): {
  name: string;
  value: number;
  color: string;
}[] => {
  if (!data) return [];

  return [
    {
      name: "Chờ xử lý",
      value: data.pending || 0,
      color: mapOrderStatusToColor("pending"),
    },
    {
      name: "Đang xử lý",
      value: data.processing || 0,
      color: mapOrderStatusToColor("processing"),
    },
    {
      name: "Đang giao",
      value: data.shipped || 0,
      color: mapOrderStatusToColor("shipped"),
    },
    {
      name: "Đã giao",
      value: data.delivered || 0,
      color: mapOrderStatusToColor("delivered"),
    },
    {
      name: "Đã hủy",
      value: data.cancelled || 0,
      color: mapOrderStatusToColor("cancelled"),
    },
  ].filter((item) => item.value > 0); // Lọc bỏ trạng thái không có đơn hàng
};

// Chuyển đổi PaymentMethodStat từ API sang định dạng hiển thị cho biểu đồ
export const adaptPaymentMethodForChart = (
  data: PaymentMethodStat[]
): {
  name: string;
  value: number;
  amount: number;
  color: string;
}[] => {
  if (!data || data.length === 0) return [];

  return data.map((method) => ({
    name: mapPaymentMethodToLabel(method.paymentMethod),
    value: method.orderCount,
    amount: method.totalAmount,
    color: mapPaymentMethodToColor(method.paymentMethod),
  }));
};
