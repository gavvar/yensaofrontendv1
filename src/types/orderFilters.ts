import { PaymentMethod } from "./order";

// Re-export các type để tránh xung đột
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Các trường có thể sắp xếp
export type OrderSortField =
  | "createdAt"
  | "updatedAt"
  | "orderNumber"
  | "orderDate" // Thêm trường này
  | "orderStatus" // Thêm trường này
  | "totalAmount"
  | "status"
  | "paymentStatus"; // Thêm trường này nếu cần

// Định nghĩa các loại filter cho danh sách đơn hàng
export interface OrderListParams {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  search?: string;
  orderNumber?: string;
  sortBy?: OrderSortField;
  sortOrder?: "asc" | "desc";
}

// Định nghĩa các filter nâng cao cho admin
export interface AdminOrderFilters extends OrderListParams {
  customerEmail?: string;
  customerPhone?: string;
  minAmount?: number;
  maxAmount?: number;
  hasShippingInfo?: boolean;
  deleted?: boolean;
  customerId?: number;
}

// Loại khoảng thời gian cho dashboard
export type DashboardPeriod =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

// Params cho dashboard
export interface OrderDashboardParams {
  period: DashboardPeriod;
  compareWithPrevious?: boolean;
  fromDate?: string;
  toDate?: string;
}

// Định nghĩa filter cho việc export đơn hàng
export interface OrderExportParams {
  orderIds?: number[];
  filters?: AdminOrderFilters;
  format?: "excel" | "pdf" | "csv";
}

// Định nghĩa filter cho việc in đơn hàng
export interface OrderPrintParams {
  includeCompanyInfo?: boolean;
  includeCustomerInfo?: boolean;
  includePaymentInfo?: boolean;
  includeSignature?: boolean;
  template?: "standard" | "compact" | "detailed";
}

// Định nghĩa params cho các hình thức phân tích đơn hàng
export interface OrderAnalyticsParams {
  groupBy:
    | "day"
    | "week"
    | "month"
    | "quarter"
    | "year"
    | "product"
    | "category"
    | "customer";
  metric: "count" | "revenue" | "avgValue";
  fromDate?: string;
  toDate?: string;
  includeRefunded?: boolean;
  includeCancelled?: boolean;
}

// Định nghĩa status chuyển tiếp hợp lệ (để kiểm tra logic chuyển trạng thái)
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled", "returned"],
  delivered: ["returned"],
  cancelled: ["pending"], // Chỉ cho phép khôi phục về pending
  returned: [], // Trạng thái returned là trạng thái cuối, không thể chuyển tiếp
};

// Định nghĩa status chuyển tiếp hợp lệ cho payment
export const VALID_PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: ["pending", "paid"],
  refunded: [],
};

// Định nghĩa các lọc đơn hàng theo thời gian
export type DateRangeType =
  | "all"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "last30"
  | "last90"
  | "thisYear"
  | "custom";

// Kiểu dữ liệu cho các bộ lọc đơn hàng (cho UI)
export interface OrderFilters {
  page: number;
  limit: number;
  sortBy: OrderSortField;
  sortOrder: "asc" | "desc";
  search?: string;
  orderStatus?: OrderStatus | OrderStatus[]; // Thay đổi kiểu
  paymentStatus?: PaymentStatus | PaymentStatus[]; // Thay đổi kiểu
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  customerId?: number;
  [key: string]: unknown; // Cho phép các key động
}

// Định nghĩa kiểu dữ liệu cho việc so sánh trạng thái đơn hàng
export interface OrderStatusData {
  statusKey: OrderStatus;
  label: string;
  count: number;
  color: string;
  icon?: string;
}

// Định nghĩa kiểu dữ liệu cho bộ lọc nhanh
export interface QuickFilter {
  label: string;
  key: string;
  value: string | boolean | number;
  count?: number;
  color?: string;
}

// Định nghĩa kiểu dữ liệu cho các nhóm bộ lọc
export interface FilterGroup {
  title: string;
  key: string;
  filters: QuickFilter[];
  expanded?: boolean;
}

// Thêm vào file
export interface OrderUIFilters extends OrderFilters {
  // Các trường bổ sung cho UI
  searchTerm?: string;
  dateRangeType?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod?: string;
}
