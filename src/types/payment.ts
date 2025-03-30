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

// Phương thức thanh toán
export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  isAvailable?: boolean;
}

// Request xử lý thanh toán
export interface ProcessPaymentRequest {
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  returnUrl: string;
  cancelUrl?: string;
}

// Request tạo thanh toán (sử dụng cùng cấu trúc với ProcessPaymentRequest)
export type CreatePaymentRequest = ProcessPaymentRequest;

// Interface cho response của xử lý thanh toán
export interface ProcessPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
  transactionId?: string;
  orderId?: number;
  orderNumber?: string;
  amount?: number;
  paymentMethod?: string;
}

// Interface cho request của processPayment
export interface ProcessPaymentStatusRequest {
  orderId: number;
}

// Interface cho response của processPayment
export interface ProcessPaymentStatusResponse {
  orderId: number;
  orderNumber: string;
  paymentStatus: string;
  status: string;
  message: string;
  paymentMethod: string;
  transactionId?: string;
  paidAt?: string;
}

// Request xác minh thanh toán
export interface VerifyPaymentRequest {
  paymentMethod: string;
  transactionId: string;
  orderId: number;
  amount: number;
  responseCode: string;
  signature?: string;
}

// Payment status type
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Response xác minh thanh toán
export interface VerifyPaymentResponse {
  verified: boolean;
  message: string;
  transactionId: string;
  orderId: number;
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
  totalAmount: number;
  items?: CouponRequestItem[];
}

// Response áp dụng mã giảm giá
export interface ApplyCouponResponse {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discount: number;
  maxDiscount?: number;
  message?: string;
}
