"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "@/contexts/authContext";
import cartService from "@/services/cartService";
import { toast } from "react-toastify";

// Types cần thiết cho checkout process
export type CheckoutStep = "shipping" | "payment" | "review" | "complete";

// Thông tin vận chuyển
export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

// Response khi áp dụng mã giảm giá
export interface CouponResponse {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  message?: string;
}

// Các phương thức thanh toán
export interface PaymentMethod {
  id: string;
  name: string;
  code: string; // COD, VNPAY, MOMO, etc.
  description?: string;
  icon?: string;
  isAvailable: boolean;
  extraInfo?: Record<string, unknown>;
}

// Thông tin tóm tắt đơn hàng
export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
}

// Request tạo đơn hàng
export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  orderNumber: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string | PaymentMethod;
  items: {
    productId: number;
    quantity: number;
    price?: number;
    options?: Record<string, string | number | boolean>;
  }[];
  couponCode?: string;
}

// Response khi tạo đơn hàng
export interface CreateOrderResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  message?: string;
}

// Request để xác thực mã giảm giá
export interface ValidateCouponRequest {
  code: string;
  totalAmount: number;
  items?: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

// Request cho thanh toán
export interface CreatePaymentRequest {
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentMethod: string | PaymentMethod;
  returnUrl: string;
  cancelUrl?: string;
}

// Response cho thanh toán
export interface CreatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

// Thông tin cần thiết cho quá trình thanh toán
export interface CheckoutPaymentInfo {
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentMethod: string | PaymentMethod;
  paymentUrl?: string;
  transactionId?: string;
  status?: string;
}

// Đảm bảo interface CartItem phù hợp với dữ liệu từ API
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  notes?: string | null;
  selectedForCheckout: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number | null;
    status: string;
    quantity: number;
    slug: string;
    images?: {
      id: number;
      url: string;
      isFeatured: boolean;
    }[];
  };
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Định nghĩa interface cho API response
interface ApiCartResponse {
  success: boolean;
  data: {
    id: number;
    items?: CartItemFromApi[];
    CartItems?: CartItemFromApi[];
    total?: number;
    itemCount?: number;
  };
  message?: string;
}

// Định nghĩa interface cho CartItem từ API
interface CartItemFromApi {
  id: number;
  productId: number;
  quantity: number;
  notes?: string | null;
  selectedForCheckout?: boolean;
  product?: ProductFromApi;
  Product?: ProductFromApi;
  subtotal?: number;
}

// Định nghĩa interface cho Product từ API
interface ProductFromApi {
  id: number;
  name: string;
  price: string | number;
  discountPrice?: string | number | null;
  status: string;
  quantity: number;
  slug: string;
  images?: {
    id: number;
    url: string;
    isFeatured: boolean;
  }[];
  categoryId?: number;
  description?: string;
  content?: string;
  unit?: string;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  viewCount?: number;
  saleCount?: number;
  sku?: string;
  weight?: string | number;
  origin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Thêm interface CartUpdateItem
export interface CartUpdateItem {
  id: number;
  quantity?: number;
  selected?: boolean;
  notes?: string;
}

// Thêm getSubtotal vào interface CartContextType
export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (
    productId: number,
    quantity: number,
    notes?: string
  ) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  removeItems: (itemIds: number[]) => Promise<void>; // Thêm phương thức này
  clearCart: () => Promise<void>;
  toggleSelectItem: (itemId: number, isSelected: boolean) => Promise<void>;
  updateNotes: (itemId: number, notes: string) => Promise<void>;
  selectAll: (selected: boolean) => Promise<void>;
  selectedItemsTotal: number;
  selectedItemsCount: number;
  getCartCount: () => number;
  getSelectedItems: () => CartItem[];
  getTotalAmount: () => number;
  getSubtotal: () => number; // Thêm phương thức này
  getSelectedItemsForCheckout: () => {
    product: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    options: Record<string, string | number | boolean>;
  }[]; // Thêm phương thức này
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Tính toán tổng số lượng và giá trị sản phẩm đã chọn
  const selectedItemsCount = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items
      .filter((item) => item.selectedForCheckout)
      .reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const selectedItemsTotal = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items
      .filter((item) => item.selectedForCheckout)
      .reduce((total, item) => total + item.subtotal, 0);
  }, [cart]);

  // Thêm fetchCart vào useCallback
  const fetchCart = useCallback(async () => {
    console.log("Fetching cart, isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("User not authenticated, returning");
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Sending request to get cart");
      const response = await cartService.getCart();
      console.log("Cart API response:", response);

      // Chuẩn hóa dữ liệu
      const normalizedCart = normalizeCartData(response);
      console.log("Normalized cart:", normalizedCart);

      setCart(normalizedCart);
    } catch (err: unknown) {
      console.error("Error fetching cart:", err);
      setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sửa useEffect
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Hàm normalizeCartData để chuẩn hóa dữ liệu từ bất kỳ cấu trúc API nào
  const normalizeCartData = (apiResponse: ApiCartResponse): Cart | null => {
    console.log("Normalizing cart data:", apiResponse);

    if (!apiResponse?.success || !apiResponse?.data) {
      console.warn("Invalid API response format:", apiResponse);
      return null;
    }

    const data = apiResponse.data;

    // Xử lý trường hợp items/CartItems
    const cartItems = data.items || data.CartItems || [];
    console.log("Cart items from API:", cartItems);

    // Map items sang cấu trúc chuẩn
    const normalizedItems = cartItems.map((item: CartItemFromApi) => {
      const product = item.product || item.Product || ({} as ProductFromApi);

      // Đảm bảo giá trị số
      const productPrice =
        typeof product.price === "string"
          ? parseFloat(product.price)
          : (product.price as number) || 0;

      const productDiscountPrice = product.discountPrice
        ? typeof product.discountPrice === "string"
          ? parseFloat(product.discountPrice)
          : (product.discountPrice as number)
        : null;

      // Tính subtotal
      const itemPrice = productDiscountPrice || productPrice;
      const subtotal = item.quantity * itemPrice;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes || "",
        selectedForCheckout:
          item.selectedForCheckout === undefined
            ? true
            : item.selectedForCheckout,
        product: {
          id: product.id,
          name: product.name,
          price: productPrice,
          discountPrice: productDiscountPrice,
          status: product.status,
          quantity: product.quantity,
          slug: product.slug,
          images: product.images || [],
        },
        subtotal: subtotal,
      };
    });

    return {
      id: data.id,
      items: normalizedItems,
      total: normalizedItems.reduce(
        (sum: number, item: CartItem) => sum + item.subtotal,
        0
      ),
      itemCount: normalizedItems.length,
    };
  };

  // 3. Sửa hàm addToCart để luôn gọi lại fetchCart
  const addToCart = async (
    productId: number,
    quantity: number,
    notes?: string
  ) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      setLoading(true);
      console.log("Adding to cart:", { productId, quantity, notes });
      const response = await cartService.addToCart(productId, quantity, notes);
      console.log("Add to cart response:", response);

      // Luôn gọi lại fetchCart sau khi thao tác thành công
      await fetchCart();
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (err: unknown) {
      console.error("Error adding to cart:", err);

      if (err instanceof Error) {
        toast.error(err.message || "Không thể thêm vào giỏ hàng");
      } else {
        toast.error("Không thể thêm vào giỏ hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm updateQuantity
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setLoading(true);
      console.log("Updating quantity:", { cartItemId, quantity });

      // Gọi API để cập nhật số lượng
      await cartService.updateQuantity(cartItemId, quantity);

      // Fetch lại giỏ hàng sau khi cập nhật thành công
      await fetchCart();

      toast.success("Đã cập nhật số lượng");
    } catch (err: unknown) {
      console.error("Error updating quantity:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Không thể cập nhật số lượng");
      } else {
        toast.error("Không thể cập nhật số lượng");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      setLoading(true);
      await cartService.removeItem(cartItemId);
      await fetchCart();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (err: unknown) {
      console.error("Error removing item:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Không thể xóa sản phẩm");
      } else {
        toast.error("Không thể xóa sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm removeItems
  const removeItems = async (itemIds: number[]) => {
    if (!itemIds.length) return; // Không thực hiện nếu mảng rỗng

    try {
      setLoading(true);
      const result = await cartService.removeItems(itemIds);
      await fetchCart();

      // Thông báo dựa trên response từ API
      if (result.message) {
        toast.success(result.message);
      } else {
        toast.success(`Đã xóa ${itemIds.length} sản phẩm khỏi giỏ hàng`);
      }
    } catch (err: unknown) {
      console.error("Error removing items:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Không thể xóa các sản phẩm");
      } else {
        toast.error("Không thể xóa các sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái chọn của một sản phẩm
  const toggleSelectItem = async (itemId: number, isSelected: boolean) => {
    try {
      setLoading(true);

      // Đảm bảo sử dụng đúng tên phương thức từ cartService
      await cartService.toggleSelect(itemId, isSelected);

      // Cập nhật state local
      setCart((prevCart) => {
        if (!prevCart) return null;

        return {
          ...prevCart,
          items: prevCart.items.map((item) =>
            item.id === itemId
              ? { ...item, selectedForCheckout: isSelected }
              : item
          ),
        };
      });
    } catch (error) {
      console.error("Error toggling item selection:", error);
      setError("Lỗi khi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const updateNotes = async (cartItemId: number, notes: string) => {
    try {
      setLoading(true);
      await cartService.updateNotes(cartItemId, notes);
      await fetchCart();
    } catch (err: unknown) {
      console.error("Error updating notes:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Không thể cập nhật ghi chú");
      } else {
        toast.error("Không thể cập nhật ghi chú");
      }
    } finally {
      setLoading(false);
    }
  };

  // Chọn tất cả hoặc bỏ chọn tất cả
  const selectAll = async (selected: boolean) => {
    try {
      setLoading(true);

      if (cart && cart.items.length > 0) {
        // Thực hiện cập nhật từng item nếu API không có selectAllItems
        const updatePromises = cart.items.map((item) =>
          cartService.toggleSelect(item.id, selected)
        );
        await Promise.all(updatePromises);
      }

      // Cập nhật state local
      setCart((prevCart) => {
        if (!prevCart) return null;

        return {
          ...prevCart,
          items: prevCart.items.map((item) => ({
            ...item,
            selectedForCheckout: selected,
          })),
        };
      });
    } catch (error) {
      console.error("Error selecting all items:", error);
      setError("Lỗi khi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart || !cart.items.length) return;

    try {
      setLoading(true);
      // Xóa từng sản phẩm khỏi giỏ hàng
      const removePromises = cart.items.map((item) =>
        cartService.removeItem(item.id)
      );
      await Promise.all(removePromises);
      await fetchCart();
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    } catch (err: unknown) {
      console.error("Error clearing cart:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Không thể xóa giỏ hàng");
      } else {
        toast.error("Không thể xóa giỏ hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Đảm bảo getCartCount hoạt động chính xác
  const getCartCount = () => {
    console.log("Getting cart count, cart:", cart);
    if (!cart?.items?.length) {
      console.log("Cart is empty, returning 0");
      return 0;
    }

    const count = cart.items.reduce((total, item) => total + item.quantity, 0);
    console.log("Calculated cart count:", count);
    return count;
  };

  // Implementasi getSelectedItems
  const getSelectedItems = () => {
    if (!cart?.items?.length) return [];
    return cart.items.filter((item) => item.selectedForCheckout);
  };

  // Implementasi getTotalAmount
  const getTotalAmount = () => {
    if (!cart?.items?.length) return 0;
    return cart.items
      .filter((item) => item.selectedForCheckout)
      .reduce((total, item) => total + item.subtotal, 0);
  };

  // Add getSubtotal implementation after getTotalAmount
  // Thêm hàm getSubtotal sau getTotalAmount
  const getSubtotal = () => {
    if (!cart?.items?.length) return 0;
    return cart.items
      .filter((item) => item.selectedForCheckout)
      .reduce((total, item) => total + item.subtotal, 0);
  };

  // Nếu getSubtotal và getTotalAmount có cùng logic, bạn cũng có thể viết:
  // const getSubtotal = getTotalAmount;

  // Thêm phương thức mới để lấy thông tin đầy đủ của các sản phẩm đã chọn
  const getSelectedItemsForCheckout = () => {
    const selectedItems =
      cart?.items.filter((item) => item.selectedForCheckout) || [];

    // Format data theo đúng cấu trúc backend mong đợi
    return selectedItems.map((item) => {
      // Chuẩn bị options object đúng kiểu
      const options: Record<string, string | number | boolean> = {};

      // Thêm notes nếu có
      if (item.notes) {
        options.notes = item.notes;
      }

      // Lấy giá từ product hoặc sử dụng giá mặc định
      const price = item.product?.price || 0;

      return {
        product: {
          id: item.productId,
          name: item.product?.name || "",
          price: price,
        },
        quantity: item.quantity,
        options,
      };
    });
  };

  // Đặt các giá trị vào context
  const contextValue: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    removeItems, // Đã thêm phương thức này
    clearCart,
    toggleSelectItem,
    updateNotes,
    selectAll,
    selectedItemsTotal,
    selectedItemsCount,
    getCartCount,
    getSelectedItems,
    getTotalAmount,
    getSubtotal, // Đã thêm hàm getSubtotal ở trên
    getSelectedItemsForCheckout, // Đã thêm phương thức này
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
