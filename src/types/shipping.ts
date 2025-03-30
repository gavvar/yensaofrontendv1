/**
 * Type definitions cho Shipping
 */

// Nhà cung cấp vận chuyển
export interface ShippingProvider {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  estimatedDeliveryTime?: string;
  isAvailable: boolean;
}

// Request tính phí vận chuyển
export interface CalculateShippingFeeRequest {
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  weight?: number;
  shippingProviderId?: string;
  productIds?: number[];
  totalAmount?: number;
}

// Response tính phí vận chuyển
export interface CalculateShippingFeeResponse {
  fee: number;
  currency: string;
  provider: string;
  estimatedDeliveryTime: string;
  availableShippingOptions?: {
    id: string;
    name: string;
    fee: number;
    estimatedDeliveryTime: string;
  }[];
}

// Thông tin địa chỉ vận chuyển
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  ward?: string;
  zipCode?: string;
  isDefault?: boolean;
}

// Thông tin sự kiện lịch sử vận chuyển
export interface ShippingHistoryEvent {
  status: string;
  description?: string;
  location?: string;
  timestamp: string;
}

// Thông tin vận chuyển trong đơn hàng
export interface ShippingInfo {
  carrier: string; // Đơn vị vận chuyển (VNPost, GHN, ...)
  provider?: string; // Nhà cung cấp dịch vụ (có thể giống carrier)
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  history: ShippingHistoryEvent[];
  trackingUrl?: string; // URL để theo dõi đơn hàng trực tiếp
}
