import { OrderStatus, PaymentStatus, PaymentMethod } from "@/types/order";

// Các trạng thái đơn hàng
export const ORDER_STATUSES = [
  { value: "pending" as OrderStatus, label: "Chờ xác nhận", color: "gray" },
  { value: "processing" as OrderStatus, label: "Đang xử lý", color: "blue" },
  { value: "shipped" as OrderStatus, label: "Đang giao", color: "orange" },
  { value: "delivered" as OrderStatus, label: "Đã giao", color: "green" },
  { value: "cancelled" as OrderStatus, label: "Đã hủy", color: "red" },
  { value: "returned" as OrderStatus, label: "Đã trả hàng", color: "purple" },
];

// Các trạng thái thanh toán
export const PAYMENT_STATUSES = [
  {
    value: "pending" as PaymentStatus,
    label: "Chưa thanh toán",
    color: "gray",
  },
  { value: "paid" as PaymentStatus, label: "Đã thanh toán", color: "green" },
  {
    value: "failed" as PaymentStatus,
    label: "Thanh toán thất bại",
    color: "red",
  },
  {
    value: "refunded" as PaymentStatus,
    label: "Đã hoàn tiền",
    color: "purple",
  },
];

// Các phương thức thanh toán
export const PAYMENT_METHODS = [
  { value: "cod" as PaymentMethod, label: "Thanh toán khi nhận hàng (COD)" },
  { value: "bank_transfer" as PaymentMethod, label: "Chuyển khoản ngân hàng" },
  { value: "momo" as PaymentMethod, label: "Ví MoMo" },
  { value: "zalopay" as PaymentMethod, label: "ZaloPay" },
  { value: "vnpay" as PaymentMethod, label: "VNPAY" },
  { value: "credit_card" as PaymentMethod, label: "Thẻ tín dụng/ghi nợ" },
];

// Các icon cho trạng thái đơn hàng
export const ORDER_STATUS_ICONS = {
  pending: "FiClock",
  processing: "FiTool",
  shipped: "FiTruck",
  delivered: "FiCheck",
  cancelled: "FiX",
  returned: "FiCornerUpLeft",
} as const;

// Các icon cho trạng thái thanh toán
export const PAYMENT_STATUS_ICONS = {
  pending: "FiClock",
  paid: "FiCheckCircle",
  failed: "FiAlertCircle",
  refunded: "FiRefreshCw",
} as const;

// Loại lọc đơn hàng theo thời gian
export const ORDER_DATE_FILTERS = [
  { value: "all", label: "Tất cả thời gian" },
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "thisWeek", label: "Tuần này" },
  { value: "lastWeek", label: "Tuần trước" },
  { value: "thisMonth", label: "Tháng này" },
  { value: "lastMonth", label: "Tháng trước" },
  { value: "last30", label: "30 ngày qua" },
  { value: "last90", label: "90 ngày qua" },
  { value: "thisYear", label: "Năm nay" },
  { value: "custom", label: "Tùy chỉnh" },
] as const;

// Khoảng thời gian cho dashboard
export const DASHBOARD_PERIODS = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "week", label: "7 ngày qua" },
  { value: "month", label: "30 ngày qua" },
  { value: "quarter", label: "Quý này" },
  { value: "year", label: "Năm nay" },
  { value: "custom", label: "Tùy chỉnh" },
] as const;
