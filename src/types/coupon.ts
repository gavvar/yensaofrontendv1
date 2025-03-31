/**
 * Types cho Coupon
 */

// Loại giảm giá
export type CouponType = "percentage" | "fixed_amount";

// Thông tin cơ bản của coupon
export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  usageLimit: number | null;
  userLimit: number | null;
  usageCount: number;
  active: boolean;
  description: string | null;
  userId: number | null;
  createdBy: number | null;
  appliedProducts: number[] | null;
  appliedCategories: number[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Interface cho validate coupon request
export interface ValidateCouponRequest {
  code: string;
  cartTotal: number;
}

// Interface cho validate coupon response
export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: {
    id: number;
    code: string;
    type: CouponType;
    value: number;
    minOrderValue: number;
    maxDiscount: number | null;
  };
  discountAmount: number;
  message: string;
}

// Interface cho cart item khi apply coupon
export interface CouponCartItem {
  productId: number;
  price: number;
  quantity: number;
}

// Interface cho apply coupon request
export interface ApplyCouponRequest {
  code: string;
  cartItems: CouponCartItem[];
}

// Interface cho apply coupon response
export interface ApplyCouponResponse {
  valid: boolean;
  coupon?: {
    id: number;
    code: string;
    type: CouponType;
    value: number;
    minOrderValue: number;
    maxDiscount: number | null;
  };
  discountAmount: number;
  message: string;
  cartTotal: number;
  finalTotal: number;
}

// Interface cho danh sách coupon response
export interface CouponListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  coupons: (Coupon & {
    applicableUser?: {
      id: number;
      name: string;
      email: string;
    };
    creator?: {
      id: number;
      name: string;
      email: string;
    };
  })[];
}

// Params cho việc lấy danh sách coupon với phân trang và lọc
export interface CouponListParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  type?: CouponType;
  fromDate?: string;
  toDate?: string;
}

// Interface cho tạo/cập nhật coupon
export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  userLimit?: number | null;
  active: boolean;
  description?: string | null;
  userId?: number | null;
  appliedProducts?: number[] | null;
  appliedCategories?: number[] | null;
}
