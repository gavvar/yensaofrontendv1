/**
 * Tập hợp các utility functions để validate dữ liệu trong ứng dụng
 */
import {
  PaymentMethod,
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
} from "@/types/order";

// Mở rộng interface UpdateOrderInfoRequest để bao gồm các trường cần thiết
interface UpdateOrderInfoRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  note?: string;
  estimatedDeliveryDate?: string;
}

// Interface cho item trong order form (bổ sung cho kiểm tra client-side)
interface OrderFormItem {
  product: {
    id: number;
    name?: string;
    price?: number;
  };
  quantity: number;
  notes?: string;
}

// Interface cho order form (client-side)
interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  items: OrderFormItem[];
  paymentMethod: PaymentMethod;
  shippingFee?: number;
  note?: string;
  couponCode?: string;
}

// Interface chung cho các kết quả validation
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Kiểm tra email có hợp lệ không
 * @param email Email cần kiểm tra
 */
export const isValidEmail = (email: string): boolean => {
  // RFC 5322 email regex
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra số điện thoại Việt Nam có hợp lệ không
 * @param phone Số điện thoại cần kiểm tra
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
  // Regex cho số điện thoại Việt Nam bắt đầu bằng 0, 84, +84 và có 10 chữ số
  const phoneRegex = /^(0|\+84|84)([3|5|7|8|9])([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Kiểm tra số điện thoại quốc tế có hợp lệ không
 * @param phone Số điện thoại cần kiểm tra
 */
export const isValidPhone = (phone: string): boolean => {
  // Regex lỏng hơn cho số điện thoại quốc tế, chấp nhận nhiều định dạng
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Kiểm tra chuỗi có phải là rỗng hoặc chỉ có khoảng trắng không
 * @param value Chuỗi cần kiểm tra
 */
export const isEmptyString = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim() === "";
};

/**
 * Kiểm tra giá trị có phải là số hợp lệ không
 * @param value Giá trị cần kiểm tra
 */
export const isValidNumber = (value: string | number): boolean => {
  if (typeof value === "number") return !isNaN(value);
  return !isNaN(Number(value)) && value.trim() !== "";
};

/**
 * Kiểm tra mã zip/postal code có hợp lệ không (cho Việt Nam và quốc tế)
 * @param zipCode Mã zip cần kiểm tra
 * @param country Quốc gia (mặc định là Việt Nam)
 */
export const isValidZipCode = (
  zipCode: string,
  country: string = "VN"
): boolean => {
  // Mã bưu chính Việt Nam gồm 5 chữ số
  if (country === "VN") {
    return /^\d{5}$/.test(zipCode);
  }

  // Mã zip quốc tế (lỏng lẻo hơn)
  return /^[a-zA-Z0-9\s-]{3,10}$/.test(zipCode);
};

/**
 * Kiểm tra đường dẫn URL có hợp lệ không
 * @param url URL cần kiểm tra
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error("Invalid URL:", url, e);
    return false;
  }
};

/**
 * Kiểm tra mật khẩu có đủ mạnh không (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
 * @param password Mật khẩu cần kiểm tra
 */
export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Kiểm tra ngày có hợp lệ không
 * @param date Ngày cần kiểm tra (Date object hoặc ISO string)
 */
export const isValidDate = (date: Date | string): boolean => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return !isNaN(date.getTime());
};

/**
 * Kiểm tra ngày có nằm trong khoảng cho phép không
 * @param date Ngày cần kiểm tra
 * @param minDate Ngày tối thiểu
 * @param maxDate Ngày tối đa
 */
export const isDateInRange = (
  date: Date | string,
  minDate?: Date | string,
  maxDate?: Date | string
): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!isValidDate(dateObj)) return false;

  if (minDate) {
    const minDateObj =
      typeof minDate === "string" ? new Date(minDate) : minDate;
    if (dateObj < minDateObj) return false;
  }

  if (maxDate) {
    const maxDateObj =
      typeof maxDate === "string" ? new Date(maxDate) : maxDate;
    if (dateObj > maxDateObj) return false;
  }

  return true;
};

/**
 * Kiểm tra đầu vào đơn hàng có hợp lệ không
 * @param orderData Dữ liệu đơn hàng
 */
export const validateOrderData = (
  orderData: OrderFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Kiểm tra thông tin khách hàng
  if (isEmptyString(orderData.customerName)) {
    errors.customerName = "Vui lòng nhập tên khách hàng";
  }

  if (isEmptyString(orderData.customerPhone)) {
    errors.customerPhone = "Vui lòng nhập số điện thoại";
  } else if (!isValidPhone(orderData.customerPhone)) {
    errors.customerPhone = "Số điện thoại không hợp lệ";
  }

  if (
    !isEmptyString(orderData.customerEmail || "") &&
    !isValidEmail(orderData.customerEmail || "")
  ) {
    errors.customerEmail = "Email không hợp lệ";
  }

  if (isEmptyString(orderData.customerAddress)) {
    errors.customerAddress = "Vui lòng nhập địa chỉ giao hàng";
  }

  // Kiểm tra danh sách sản phẩm
  if (
    !orderData.items ||
    !Array.isArray(orderData.items) ||
    orderData.items.length === 0
  ) {
    errors.items = "Đơn hàng phải có ít nhất một sản phẩm";
  } else {
    // Kiểm tra từng sản phẩm
    orderData.items.forEach((item, index) => {
      if (!item.product || !item.product.id) {
        errors[`items[${index}].product`] = "Sản phẩm không hợp lệ";
      }

      if (!isValidNumber(item.quantity) || Number(item.quantity) <= 0) {
        errors[`items[${index}].quantity`] = "Số lượng phải lớn hơn 0";
      }
    });
  }

  // Kiểm tra phương thức thanh toán
  if (isEmptyString(orderData.paymentMethod)) {
    errors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Kiểm tra thông tin cập nhật đơn hàng có hợp lệ không
 * @param updateData Dữ liệu cập nhật
 */
export const validateOrderUpdateData = (
  updateData: Partial<UpdateOrderInfoRequest>
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nếu có cập nhật thông tin khách hàng
  if (
    updateData.customerName !== undefined &&
    isEmptyString(updateData.customerName)
  ) {
    errors.customerName = "Tên khách hàng không được để trống";
  }

  if (updateData.customerPhone !== undefined) {
    if (isEmptyString(updateData.customerPhone)) {
      errors.customerPhone = "Số điện thoại không được để trống";
    } else if (!isValidPhone(updateData.customerPhone)) {
      errors.customerPhone = "Số điện thoại không hợp lệ";
    }
  }

  if (
    updateData.customerEmail !== undefined &&
    !isEmptyString(updateData.customerEmail) &&
    !isValidEmail(updateData.customerEmail)
  ) {
    errors.customerEmail = "Email không hợp lệ";
  }

  if (
    updateData.customerAddress !== undefined &&
    isEmptyString(updateData.customerAddress)
  ) {
    errors.customerAddress = "Địa chỉ giao hàng không được để trống";
  }

  // Nếu có cập nhật ngày giao hàng dự kiến
  if (
    updateData.estimatedDeliveryDate !== undefined &&
    !isEmptyString(updateData.estimatedDeliveryDate) &&
    !isValidDate(updateData.estimatedDeliveryDate)
  ) {
    errors.estimatedDeliveryDate = "Ngày giao hàng dự kiến không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Kiểm tra thông tin cập nhật trạng thái đơn hàng có hợp lệ không
 * @param statusData Dữ liệu cập nhật trạng thái
 */
export const validateOrderStatusUpdate = (
  statusData: Partial<UpdateOrderStatusRequest>
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmptyString(statusData.orderStatus)) {
    errors.orderStatus = "Vui lòng chọn trạng thái đơn hàng";
  }

  // Kiểm tra thông tin vận chuyển khi chuyển sang trạng thái "shipped"
  if (statusData.orderStatus === "shipped") {
    if (
      statusData.trackingNumber !== undefined &&
      isEmptyString(statusData.trackingNumber)
    ) {
      errors.trackingNumber = "Vui lòng nhập mã vận đơn";
    }

    if (
      statusData.shippingProvider !== undefined &&
      isEmptyString(statusData.shippingProvider)
    ) {
      errors.shippingProvider = "Vui lòng chọn đơn vị vận chuyển";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Kiểm tra thông tin cập nhật trạng thái thanh toán có hợp lệ không
 * @param paymentData Dữ liệu cập nhật thanh toán
 */
export const validatePaymentStatusUpdate = (
  paymentData: Partial<UpdatePaymentStatusRequest> & { transactionId?: string }
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmptyString(paymentData.status as string)) {
    errors.status = "Vui lòng chọn trạng thái thanh toán";
  }

  // Kiểm tra thông tin thanh toán khi chuyển sang trạng thái "paid"
  if (
    paymentData.status === "paid" &&
    paymentData.transactionId !== undefined &&
    isEmptyString(paymentData.transactionId)
  ) {
    errors.transactionId = "Vui lòng nhập mã giao dịch";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validators = {
  isValidEmail,
  isValidVietnamesePhone,
  isValidPhone,
  isEmptyString,
  isValidNumber,
  isValidZipCode,
  isValidUrl,
  isStrongPassword,
  isValidDate,
  isDateInRange,
  validateOrderData,
  validateOrderUpdateData,
  validateOrderStatusUpdate,
  validatePaymentStatusUpdate,
};

export default validators;
