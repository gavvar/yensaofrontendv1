import { getFullImageUrl } from "./image";

// Định nghĩa kiểu dữ liệu cho product image
interface ProductImage {
  id: number;
  url: string;
  isFeatured?: boolean;
}

// Định nghĩa kiểu dữ liệu tối thiểu cho product
interface ProductWithImages {
  images?: ProductImage[];
  name?: string;
}

/**
 * Lấy URL hình ảnh đại diện cho sản phẩm
 */
export function getProductImageUrl(product: ProductWithImages): string {
  // Kiểm tra nếu có mảng images
  if (
    product?.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    // Ưu tiên ảnh được đánh dấu là featured
    const featuredImage = product.images.find((img) => img.isFeatured);
    if (featuredImage && featuredImage.url) {
      return getFullImageUrl(featuredImage.url);
    }

    // Nếu không có ảnh featured, lấy ảnh đầu tiên
    return getFullImageUrl(product.images[0].url);
  }

  // Fallback nếu không có ảnh
  return "/images/product-placeholder.png";
}
