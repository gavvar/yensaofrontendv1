export type PeriodType = "week" | "month" | "quarter" | "year";
export type GroupByType = "day" | "week" | "month";

export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  newCustomers: number;
  productsSold: number;
  period: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  product: {
    name: string;
    slug: string;
    thumbnail: string;
  };
}

export interface PaymentMethodStat {
  paymentMethod: string;
  orderCount: number;
  totalAmount: number;
}

export interface OrderStatusStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}
