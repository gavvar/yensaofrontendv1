/**
 * Type definitions cho Payment
 */

// Define PaymentData interface for payment processing
export interface PaymentData {
  transactionId?: string;
  referenceId?: string;
  gatewayResponse?: Record<string, string>;
  paymentStatus?: string;
  bankCode?: string;
  cardNumber?: string;
  paymentDate?: string;
  paymentMethod?: string;
  message?: string;
  [key: string]: string | Record<string, string> | undefined;
}

// Định nghĩa cấu trúc dữ liệu cho thông tin bổ sung của phương thức thanh toán
export interface PaymentMethodExtraInfo {
  // Thông tin cho VNPAY
  bankCode?: string;
  cardType?: string;
  promotionCode?: string;

  // Thông tin cho MOMO
  storeId?: string;
  storeName?: string;

  // Thông tin cho Bank Transfer
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  branch?: string;
  transferNote?: string;

  // Thông tin khác
  [key: string]: string | number | boolean | undefined;
}

export type PaymentMethodCode = "cod" | "momo" | "zalopay" | "banking" | string;

// Cập nhật PaymentMethod interface để phù hợp với dữ liệu từ API
export interface PaymentMethod {
  id: string;
  code?: string;
  name: string; // Thêm trường name
  description: string; // Thêm trường description
  icon?: string;
  isActive?: boolean;
  enabled?: boolean; // Thêm trường enabled từ API
  sortOrder?: number;
}

// Request/Response cho API lấy phương thức thanh toán
export interface GetPaymentMethodsResponse {
  success: boolean;
  message?: string;
  data: PaymentMethod[];
}

// Request tạo thanh toán
export interface ProcessPaymentRequest {
  orderId: number;
  method: PaymentMethodCode;
  clientUrl: string;
  returnUrl?: string;
  orderNumber?: string;
  amount?: number;
}

// Response từ API tạo thanh toán
export interface ProcessPaymentResponse {
  success: boolean;
  message?: string;
  data: {
    orderId: number;
    paymentUrl?: string;
    paymentStatus: "pending" | "paid" | "cancelled" | "error";
    message?: string;
  };
}

// Request xác thực thanh toán
export interface VerifyPaymentRequest {
  orderId: number;
}

// Response từ API xác thực thanh toán
export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data: {
    orderId: number;
    orderNumber: string;
    paymentStatus: "pending" | "paid" | "cancelled" | "error";
    paymentMethod: PaymentMethodCode;
    message?: string;
  };
}

// Request kiểm tra trạng thái thanh toán
export interface ProcessPaymentStatusRequest {
  orderId: number;
}

// Response từ API kiểm tra trạng thái thanh toán
export interface ProcessPaymentStatusResponse {
  success: boolean;
  message?: string;
  data: {
    paymentStatus?: "pending" | "paid" | "failed";
    status?: "pending" | "success" | "failed";
    transactionId?: string;
    paidAt?: string;
    paymentMethod?: string;
    message?: string;
  };
}

// Request xác minh thanh toán
export interface VerifyPaymentRequest {
  orderId: number;
  paymentId?: string; // Để optional
  paymentMethod?: string; // Để optional
  transactionId?: string; // Optional
  amount?: number; // Thêm dấu ? để làm cho nó optional
  responseCode?: string; // Thêm dấu ? để làm cho nó optional
  signature?: string;
}

// Payment status type
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Response xác minh thanh toán
export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data: {
    // Sử dụng data thay vì result
    orderId: number;
    orderNumber: string;
    paymentStatus: "pending" | "paid" | "cancelled" | "error";
    paymentMethod: PaymentMethodCode;
    message?: string;
  };
  orderId?: number;
  verified: boolean;
  transactionId: string;
  orderNumber: string;
  paymentStatus?: string;
}

// Thông tin thanh toán trong đơn hàng
export interface PaymentInfo {
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  transactionDate?: string;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  currency: string;
}

// Discount type
export type DiscountType = "percentage" | "fixed";

// Coupon / Mã giảm giá
export interface Coupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  isActive: boolean;
  description?: string;
}

// Item in coupon request
export interface CouponRequestItem {
  productId: number;
  quantity: number;
  price: number;
}

// Request áp dụng mã giảm giá
export interface ApplyCouponRequest {
  code: string;
  totalAmount: number; // Thêm trường này
  subtotal?: number; // Giữ lại trường này nếu cần
  orderId?: number;
  cartItems?: Array<{
    productId: number;
    price: number;
    quantity: number;
  }>;
}

// Định nghĩa cho request và response của việc áp dụng mã giảm giá

export interface CouponInfo {
  id: number;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
}

// Cập nhật định nghĩa ApplyCouponResponse
export interface ApplyCouponResponse {
  success: boolean;
  message?: string;
  data?: {
    valid?: boolean;
    isValid?: boolean;
    code?: string;
    discountType?: "percentage" | "fixed" | "fixed_amount";
    discountValue?: number;
    discountAmount?: number; // Đây là thuộc tính chứa số tiền giảm
    discount?: number; // Thêm trường này làm alias cho discountAmount
    subtotalAfterDiscount?: number;
    cartTotal?: number;
    finalTotal?: number;
    coupon?: CouponInfo;
    message?: string;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    expiryDate?: string;
    couponId?: number;
  };
  error?: {
    message: string;
    isValidationError?: boolean;
  };
}

// Định nghĩa API Response chung
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T; // Sử dụng data thay vì result
}

// Định nghĩa cho callback parameters
export interface PaymentCallbackParams {
  [key: string]: string;
}

// Định nghĩa response cho handleCallback
export interface HandleCallbackResponse {
  success: boolean;
  status?: "success" | "pending" | "error";
  message?: string;
  data?: {
    orderId?: number;
    orderNumber?: string;
    paymentStatus?: string;
    transactionId?: string;
    amount?: number;
    paymentMethod?: string;
    paidAt?: string;
  };
}
