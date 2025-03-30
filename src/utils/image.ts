/**
 * Lấy URL đầy đủ cho ảnh từ backend
 */
export function getFullImageUrl(imagePath?: string): string {
  // Nếu không có đường dẫn, trả về ảnh placeholder
  if (!imagePath) {
    return "/images/product-placeholder.png"; // Đồng bộ với đường dẫn trong ProductCard
  }

  // Nếu đã là URL đầy đủ
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Base URL của backend
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Đường dẫn chuẩn hóa
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  // URL đầy đủ
  return `${baseUrl}${path}`;
}
