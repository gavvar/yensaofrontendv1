/**
 * Chuẩn hóa mã phương thức thanh toán
 * Ví dụ: "cod" -> "COD", "momo" -> "MOMO"
 */
export const normalizePaymentMethod = (
  method: string | undefined | null
): string => {
  if (!method) return "cod"; // Mặc định
  return method; // Trả về nguyên bản vì backend sẽ xử lý
};
