/**
 * Type definitions cho Order
 */

// Các loại trạng thái đơn hàng
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

// Các loại trạng thái thanh toán
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Phương thức thanh toán
export enum PaymentMethod {
  COD = "cod",
  VNPAY = "vnpay",
  MOMO = "momo",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
}

// Kiểu ghi chú đơn hàng
export type OrderNoteType = "customer" | "admin" | "system";

// Định nghĩa kiểu cụ thể cho product options
export type ProductOptionValue = string | number | boolean;
export interface ProductOptions {
  [key: string]: ProductOptionValue;
}

// Thông tin từng sản phẩm trong đơn hàng
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  sku?: string;
  variantName?: string;
  productImage?: string;
  product?: ProductReference; // Thay thế any bằng kiểu cụ thể
  options?: ProductOptions; // Thay thế any bằng kiểu đã định nghĩa
  subtotal?: number; // Có thể được tính từ price * quantity
}

// Tham chiếu đến sản phẩm (khi join với bảng product)
export interface ProductReference {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  price?: number;
  [key: string]: unknown; // Cho phép các trường khác nhưng không dùng any
}

// Cấu trúc thay thế
export interface AlternativeOrderItem {
  productId: number;
  quantity: number;
  options?: ProductOptions;
}

// Thông tin đơn hàng đầy đủ
export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus; // Thêm trường này nếu chưa có
  paymentStatus: PaymentStatus;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string; // Thêm trường này nếu chưa có
  updatedAt: string; // Thêm trường này nếu chưa có
  items: OrderItem[];
  customerId?: number; // ID của khách hàng (nếu đã đăng ký)
  customerAddress: string;
  orderStatus: OrderStatus;
  orderDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  shippingFee: number;
  paymentMethod: string; // Sử dụng string thay vì enum để dễ mở rộng
  paymentId?: string; // ID giao dịch từ cổng thanh toán
  paidAt?: string; // Thời gian thanh toán
  note?: string; // Ghi chú đơn (1 ghi chú)
  notes?: OrderNote[]; // Thêm trường notes nếu cần
  currency?: string;
  couponCode?: string;
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  deleted?: boolean; // Trạng thái đã xóa hay chưa
}

// Thông tin rút gọn cho danh sách đơn hàng
export interface OrderSummary {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus; // Hoặc status nếu muốn giữ tính nhất quán với Order
  paymentStatus: PaymentStatus;
  totalAmount: number;
  orderDate: string; // Hoặc createdAt nếu muốn giữ tính nhất quán với Order
  customerName: string;
  email?: string;
  phone?: string;
  itemCount: number; // Thêm trường này
  currency?: string;
  items: {
    count: number;
    productId: number;
    productName: string;
    price: number;
  }[];
  customerPhone?: string;
  customerEmail?: string;
  deleted?: boolean;
}

// API Request tạo đơn hàng
export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Partial<OrderItem>[] | OrderItem[]; // Cho phép cả Partial<OrderItem>[]
  paymentMethod: string;
  orderNumber?: string; // Số đơn hàng (có thể tạo ở frontend)
  shippingFee: number; // Phí vận chuyển
  subtotal: number; // Tổng tiền hàng chưa tính thuế, phí
  totalAmount: number; // Tổng tiền bao gồm thuế, phí
  discount?: number; // Giảm giá
  tax?: number; // Thuế
  couponCode?: string; // Mã giảm giá
  note?: string; // Ghi chú
}

// Response khi tạo đơn hàng
export interface CreateOrderResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  id?: number;
  message?: string;
  order?: Order;
  data?: {
    id: number;
    orderNumber: string;
  };
}

// Response khi xác thực mã giảm giá
export interface CouponResponse {
  success: boolean;
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discount: number;
  maxDiscount?: number;
  message?: string;
}

// Request cập nhật thông tin đơn hàng
export interface UpdateOrderInfoRequest {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  note?: string;
}

// Request cập nhật trạng thái đơn hàng
export interface UpdateOrderStatusRequest {
  orderStatus: OrderStatus;
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
}

// Request cập nhật trạng thái thanh toán
export interface UpdatePaymentStatusRequest {
  status: PaymentStatus; // Nếu API yêu cầu tên là status
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  paidAt?: string;
}

// Định nghĩa trạng thái đơn hàng với màu sắc và label
export interface OrderStatusInfo {
  value: OrderStatus;
  label: string;
  color: string;
}

// Định nghĩa trạng thái thanh toán với màu sắc và label
export interface PaymentStatusInfo {
  value: PaymentStatus;
  label: string;
  color: string;
}

// Response cho việc lấy các trạng thái
export interface GetOrderStatusesResponse {
  orderStatuses: OrderStatusInfo[];
  paymentStatuses: PaymentStatusInfo[];
}

// Params cho Order List API
export interface OrderListParams {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  orderNumber?: string; // Added for searching by order number
}

// Response cho Order List API
export interface OrderListResponse {
  orders: OrderSummary[]; // Thêm thuộc tính orders
  pagination: PaginationData;
  // Có thể có thêm các thuộc tính khác như success, message, ...
}

// Thêm interface này vào file types/order.ts
export interface OrderItemRequest {
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
  originalPrice?: number;
  discountValue?: number;
  productOptions?: Record<string, string | number | boolean | null>;
}

// Ghi chú đơn hàng
export interface OrderNote {
  id: number;
  orderId: number;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  authorId?: number;
  authorName?: string; // Tên người tạo ghi chú
}

// Dữ liệu theo dõi đơn hàng
export interface OrderTracking {
  trackingNumber: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
  events?: OrderTrackingEvent[];
}

// Sự kiện trong quá trình vận chuyển
export interface OrderTrackingEvent {
  date: string;
  status: string;
  location?: string;
  description: string;
}

// Định nghĩa metadata type để thay thế any
export interface OrderMetadata {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | string[]
    | number[]
    | OrderMetadataObject;
}

// Đối tượng con trong metadata
export interface OrderMetadataObject {
  [key: string]: string | number | boolean | null | string[] | number[];
}

// Lịch sử đơn hàng
export interface OrderHistory {
  id: number;
  orderId: number;
  event: string;
  prevStatus?: string;
  newStatus?: string;
  description?: string;
  metadata?: OrderMetadata; // Thay thế Record<string, any>
  createdAt: string;
  createdBy?: string;
}

// Định nghĩa OrderHistoryEntry
export interface OrderHistoryEntry {
  id: number;
  orderId: number;
  action: string;
  details?: string;
  previousState?: Partial<Order>;
  newState?: Partial<Order>;
  metadata?: OrderMetadata; // Thay thế Record<string, any>
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  userRole?: string;
}

// Mở rộng Order interface để thêm các trường cho admin
export interface OrderWithNotes extends Order {
  notes: OrderNote[]; // Danh sách các ghi chú
}

// Request để thêm ghi chú cho đơn hàng
export interface AddOrderNoteRequest {
  note: string;
  noteType: OrderNoteType;
  isInternal?: boolean;
}

// Định nghĩa phần trăm thay đổi
export interface PercentageChange {
  revenue: number;
  orderCount: number;
}

// Dữ liệu so sánh với kỳ trước
export interface PreviousPeriodComparison {
  period: string;
  orderCounts: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
  dailyOrders: {
    date: string;
    count: number;
    revenue?: number;
  }[];
  topProducts?: TopProductStats[];
  // Có thể có thêm các thuộc tính khác
}

// API Response cho Dashboard đơn hàng
export interface OrderDashboardResponse {
  period: string;
  orderCounts: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
  dailyOrders: {
    date: string;
    count: number;
    revenue?: number;
  }[];
  topProducts?: TopProductStats[];
  recentOrders?: OrderSummary[]; // Thêm trường này
  comparisonWithPrevious?: PreviousPeriodComparison;
}

// API Response cho export đơn hàng
export interface OrderExportResponse {
  orders: Order[];
  totalOrders: number;
  generatedAt: string;
}

// API Request để khôi phục đơn hàng
export interface RestoreOrderRequest {
  id: number;
}

// Thống kê đơn hàng theo trạng thái
export interface OrderCountStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// Thống kê doanh thu theo phương thức thanh toán
export interface PaymentMethodStats {
  method: string;
  count: number;
  percentage: number;
}

// Thống kê sản phẩm bán chạy
export interface TopProductStats {
  id: number;
  name: string;
  productName?: string; // Thêm trường này để hỗ trợ tương thích ngược
  quantity: number;
  totalSold?: number; // Thêm trường này để hỗ trợ tương thích ngược
  revenue: number;
  image?: string;
}

// Dữ liệu thống kê đơn hàng theo ngày
export interface DailyOrderStats {
  date: string;
  count: number;
  revenue: number;
}

// Dữ liệu phân trang
export interface PaginationData {
  page: number;
  limit: number;
  total: number; // Đảm bảo tên này là total, không phải totalItems
  totalPages: number;
}

// API Response cho Admin Dashboard với dữ liệu hiện tại và kỳ trước
export interface AdminDashboardResponse {
  current: OrderDashboardResponse;
  previous?: OrderDashboardResponse;
  success?: boolean;
  message?: string;
}
