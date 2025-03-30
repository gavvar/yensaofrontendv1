import {
  Order,
  OrderStatus,
  OrderItem,
  OrderSummary,
  ProductOptions,
} from "@/types/order";
import { CartItem } from "@/contexts/CartContext";
import { formatCurrency } from "./format";
import { Product } from "@/types/product";

// Thêm interface để mở rộng Order với trường deliveredAt
interface OrderWithDelivery extends Order {
  deliveredAt?: string;
}

/**
 * Tính tổng tiền đơn hàng từ danh sách sản phẩm
 */
export const calculateOrderTotal = (
  items: OrderItem[] | CartItem[]
): number => {
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    let price = 0;

    // Kiểm tra kiểu dữ liệu của item
    if ("price" in item && typeof item.price === "number") {
      // Trường hợp OrderItem có trường price
      price = item.price;
    } else if ("product" in item && item.product) {
      // Trường hợp CartItem có product.price
      const productPrice = (item.product as Product).price;
      if (typeof productPrice === "number") {
        price = productPrice;
      }
    }

    const quantity = item.quantity;
    return total + price * quantity;
  }, 0);
};

/**
 * Tính phí vận chuyển dựa trên tổng tiền hàng và địa chỉ
 */
export const calculateShippingFee = (
  subtotal: number,
  address?: string,
  weight?: number
): number => {
  // Free shipping for orders over 500,000 VND
  if (subtotal >= 500000) return 0;

  // Base shipping fee
  let baseFee = 30000;

  // Add extra fee for remote areas if address is provided
  if (address) {
    const remoteAreas = [
      "Hà Giang",
      "Cao Bằng",
      "Lào Cai",
      "Bắc Kạn",
      "Lạng Sơn",
      "Tuyên Quang",
      "Yên Bái",
      "Thái Nguyên",
      "Điện Biên",
      "Lai Châu",
      "Sơn La",
      "Hòa Bình",
      "Cà Mau",
      "Bạc Liêu",
      "Kiên Giang",
      "Sóc Trăng",
    ];

    const isRemoteArea = remoteAreas.some((area) => address.includes(area));
    if (isRemoteArea) {
      baseFee += 20000;
    }
  }

  // Add extra fee based on weight if provided
  if (weight && weight > 1) {
    const extraWeight = weight - 1; // Weight over 1kg
    const extraFee = Math.ceil(extraWeight) * 10000;
    baseFee += extraFee;
  }

  return baseFee;
};

/**
 * Tính thuế cho đơn hàng (nếu có)
 */
export const calculateTax = (subtotal: number, taxRate: number = 0): number => {
  return subtotal * (taxRate / 100);
};

/**
 * Lấy văn bản trạng thái đơn hàng dựa trên mã trạng thái
 */
export const getOrderStatusText = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "processing":
      return "Đang xử lý";
    case "shipped":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao hàng";
    case "cancelled":
      return "Đã hủy";
    case "returned":
      return "Đã trả hàng";
    default:
      return "Không xác định";
  }
};

/**
 * Định dạng tóm tắt đơn hàng để hiển thị
 */
export const formatOrderSummary = (order: Order): string => {
  const { orderNumber, totalAmount, items, orderStatus } = order;
  const statusText = getOrderStatusText(orderStatus);

  return `Đơn hàng #${orderNumber} - ${formatCurrency(totalAmount)} - ${
    items.length
  } sản phẩm - ${statusText}`;
};

/**
 * Kiểm tra xem đơn hàng có thể hủy hay không
 */
export const canCancelOrder = (order: Order | OrderSummary): boolean => {
  // Orders can be cancelled if they are pending or processing
  return ["pending", "processing"].includes(order.orderStatus);
};

/**
 * Tạo mã đơn hàng ngẫu nhiên
 */
export const generateOrderNumber = (): string => {
  const prefix = "YS"; // Prefix cho đơn hàng của Yensao
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${timestamp}${random}`;
};

/**
 * Lọc đơn hàng theo trạng thái
 */
export const filterOrdersByStatus = (
  orders: Order[] | OrderSummary[],
  status?: OrderStatus
): (Order | OrderSummary)[] => {
  if (!status) return orders;

  return orders.filter((order) => order.orderStatus === status);
};

/**
 * Ước tính thời gian giao hàng dựa trên địa chỉ và phương thức vận chuyển
 */
export const estimateDeliveryDate = (
  orderDate: Date,
  address: string,
  shippingMethod: string = "standard"
): Date => {
  const deliveryDate = new Date(orderDate);

  // Base processing time: 1 day
  deliveryDate.setDate(deliveryDate.getDate() + 1);

  // Delivery time based on shipping method
  if (shippingMethod === "express") {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  } else if (shippingMethod === "standard") {
    deliveryDate.setDate(deliveryDate.getDate() + 3);
  } else {
    deliveryDate.setDate(deliveryDate.getDate() + 5);
  }

  // Add extra time for remote areas
  const remoteAreas = [
    "Hà Giang",
    "Cao Bằng",
    "Lào Cai",
    "Bắc Kạn",
    "Lạng Sơn",
    "Tuyên Quang",
    "Yên Bái",
    "Thái Nguyên",
    "Điện Biên",
    "Lai Châu",
    "Sơn La",
    "Hòa Bình",
    "Cà Mau",
    "Bạc Liêu",
    "Kiên Giang",
    "Sóc Trăng",
  ];

  const isRemoteArea = remoteAreas.some((area) => address.includes(area));
  if (isRemoteArea) {
    deliveryDate.setDate(deliveryDate.getDate() + 2);
  }

  // Skip weekends (for simplicity, not accounting for holidays)
  const dayOfWeek = deliveryDate.getDay();
  if (dayOfWeek === 0) {
    // Sunday
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  } else if (dayOfWeek === 6) {
    // Saturday
    deliveryDate.setDate(deliveryDate.getDate() + 2);
  }

  return deliveryDate;
};

/**
 * Kiểm tra xem sản phẩm có thể trả lại hay không
 */
export const canReturnOrder = (order: OrderWithDelivery): boolean => {
  if (order.orderStatus !== "delivered") return false;

  // Can return within 7 days of delivery
  const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
  if (!deliveredDate) return false;

  const today = new Date();
  const daysSinceDelivery = Math.floor(
    (today.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceDelivery <= 7;
};

/**
 * Chuyển đổi từ CartItem sang đơn giản hóa OrderItem format cho hiển thị
 * (không phải cho API, do không có đủ trường cần thiết)
 */
export const cartItemsToSimpleOrderItems = (
  cartItems: CartItem[]
): Array<{
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  options?: ProductOptions;
}> => {
  return cartItems.map((item) => {
    const product = item.product as Product;
    return {
      productId: item.productId,
      productName: product?.name || "Sản phẩm",
      price: product?.price || 0,
      quantity: item.quantity,
      subtotal: (product?.price || 0) * item.quantity,
      options: item.notes ? { notes: item.notes } : undefined,
    };
  });
};

/**
 * Chuyển đổi từ CartItem sang OrderItem format đầy đủ cho API
 * Lưu ý: Cần server tạo id, orderId và một số trường khác
 */
export const cartItemsToOrderItems = (
  cartItems: CartItem[]
): Partial<OrderItem>[] => {
  return cartItems.map((item) => {
    const product = item.product as Product;

    return {
      productId: item.productId,
      productName: product?.name || "Sản phẩm",
      price: product?.price || 0,
      quantity: item.quantity,
      subtotal: (product?.price || 0) * item.quantity,
      options: item.notes ? { notes: item.notes } : undefined,
      productImage:
        product?.images && product.images.length > 0
          ? product.images[0].url
          : undefined,
    };
  });
};

/**
 * Chuyển đổi CartItem sang OrderItemRequest (định dạng hiển thị)
 */
export const cartItemsToOrderItemRequests = (
  cartItems: CartItem[]
): OrderItemRequest[] => {
  return cartItems.map((item) => {
    const product = item.product as Product;

    // Lấy hình ảnh đầu tiên hoặc hình ảnh đại diện
    const featuredImage =
      product?.images?.find((img) => img.isFeatured)?.url ||
      (product?.images && product.images.length > 0
        ? product.images[0].url
        : "");

    // Giá gốc và giá sau giảm
    const originalPrice = product?.price || 0;
    const finalPrice = product?.discountPrice || product?.price || 0;
    const discountValue = originalPrice - finalPrice;

    // Xây dựng object cơ bản
    const orderItem: OrderItemRequest = {
      productId: item.productId,
      productName: product?.name || "",
      productImage: featuredImage,
      originalPrice: originalPrice,
      price: finalPrice,
      quantity: item.quantity,
      subtotal: finalPrice * item.quantity,
      discountValue: discountValue,
    };

    // Thêm productOptions nếu có notes
    if (item.notes) {
      orderItem.productOptions = { note: item.notes };
    }

    return orderItem;
  });
};

// Thêm interface này để mô tả đầy đủ đối tượng OrderItemRequest
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
