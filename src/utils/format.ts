import { OrderStatus, PaymentStatus, PaymentMethod } from "@/types/order";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/constants/order";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Format giá tiền sang định dạng VND
 */
export const formatCurrency = (value: number, currency: string = "VND") => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format ngày tháng
 */
export const formatDate = (dateStr: string) => {
  try {
    const date =
      typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "dd/MM/yyyy", { locale: vi });
  } catch (error) {
    console.log("Error formatting date:", error);
    return dateStr;
  }
};

/**
 * Định dạng ngày giờ
 * @param dateString Chuỗi ngày giờ
 * @param format Định dạng (default: 'full', options: 'full', 'short', 'date', 'time', 'long')
 * @returns Chuỗi ngày giờ đã được định dạng
 */
export const formatDateTime = (
  dateString: string | Date,
  format: "full" | "short" | "date" | "time" | "long" = "full"
): string => {
  if (!dateString) return "";

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) {
    console.error("Ngày không hợp lệ:", dateString);
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Ho_Chi_Minh", // Múi giờ Việt Nam
  };

  switch (format) {
    case "short":
      // VD: 15/04/2023
      options.day = "2-digit";
      options.month = "2-digit";
      options.year = "numeric";
      break;
    case "date":
      // VD: 15 tháng 4, 2023
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      break;
    case "time":
      // VD: 14:30
      options.hour = "2-digit";
      options.minute = "2-digit";
      break;
    case "long":
      // VD: 15 tháng 4, 2023, 14:30:45
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      break;
    case "full":
    default:
      // VD: 15 tháng 4, 2023, 14:30
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      options.hour = "2-digit";
      options.minute = "2-digit";
      break;
  }

  return new Intl.DateTimeFormat("vi-VN", options).format(date);
};

/**
 * Format số tiền theo loại tiền tệ
 * @param amount Số tiền
 * @param currency Loại tiền tệ (mặc định VND)
 */
export const formatAmount = (
  amount: number | undefined,
  currency: string = "VND"
): string => {
  if (amount === undefined || amount === null) return "Liên hệ";

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return `${amount.toLocaleString()} ${currency}`;
  }
};

/**
 * Format trạng thái đơn hàng thành text
 * @param status Trạng thái đơn hàng
 */
export const formatOrderStatus = (status: OrderStatus): string => {
  const statusInfo = ORDER_STATUSES.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : status;
};

/**
 * Format trạng thái thanh toán thành text
 * @param status Trạng thái thanh toán
 */
export const formatPaymentStatus = (status: PaymentStatus): string => {
  const statusInfo = PAYMENT_STATUSES.find((s) => s.value === status);
  return statusInfo ? statusInfo.label : status;
};

/**
 * Format phương thức thanh toán thành text
 * @param method Phương thức thanh toán
 */
export const formatPaymentMethod = (method: PaymentMethod | string): string => {
  const methodInfo = PAYMENT_METHODS.find(
    (m) => m.value === method.toLowerCase()
  );
  return methodInfo ? methodInfo.label : String(method);
};

/**
 * Format địa chỉ thành dạng đầy đủ
 * @param address Địa chỉ
 * @param district Quận/Huyện
 * @param city Thành phố
 */
export const formatAddress = (
  address?: string,
  district?: string,
  city?: string
): string => {
  const parts = [address, district, city].filter(Boolean);
  return parts.join(", ");
};

/**
 * Format số điện thoại Việt Nam
 * @param phone Số điện thoại cần format
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // Xóa bỏ tất cả ký tự không phải số
  const cleaned = phone.replace(/\D/g, "");

  // Kiểm tra độ dài sau khi đã xóa ký tự không phải số
  if (cleaned.length < 9 || cleaned.length > 11) {
    return phone; // Trả về nguyên bản nếu không phải số điện thoại hợp lệ
  }

  // Format theo kiểu Việt Nam: 0xxx xxx xxx hoặc +84 xxx xxx xxx
  if (cleaned.startsWith("84") && cleaned.length >= 11) {
    // Trường hợp +84
    const part1 = cleaned.slice(2, 5);
    const part2 = cleaned.slice(5, 8);
    const part3 = cleaned.slice(8);
    return `+84 ${part1} ${part2} ${part3}`;
  } else {
    // Trường hợp số Việt Nam thông thường
    const part1 = cleaned.slice(0, 4);
    const part2 = cleaned.slice(4, 7);
    const part3 = cleaned.slice(7);
    return `${part1} ${part2} ${part3}`;
  }
};

/**
 * Format số lượng với đơn vị (1k, 1m, v.v...)
 * @param number Số lượng
 */
export const formatNumber = (number: number): string => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  }
  return number.toString();
};

/**
 * Format thời gian tương đối (vd: 5 phút trước)
 * @param dateString Chuỗi thời gian
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else {
    return formatDate(date.toString());
  }
};

/**
 * Format ngày tháng cho hiển thị đơn hàng
 * @param dateStr Chuỗi ngày
 */
export const formatOrderDate = (dateStr: string) => {
  try {
    const date =
      typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(date, "dd/MM/yyyy", { locale: vi });
  } catch (error) {
    console.error("Error formatting order date:", error);
    return dateStr;
  }
};
