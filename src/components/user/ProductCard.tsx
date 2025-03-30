import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { getFullImageUrl } from "@/utils/image";

interface ProductCardProps {
  product: Product;
}

// Cập nhật ProductCard để hiển thị thông tin về lượt xem và số lượng đã bán
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Lấy ảnh đại diện (thumbnail) của sản phẩm
  const thumbnailImage =
    product.images?.find((img) => img.isFeatured) || product.images?.[0];

  // // Tính phần trăm giảm giá nếu có
  // const discountPercentage =
  //   product.discountPrice && product.price
  //     ? Math.round(
  //         ((Number(product.price) - Number(product.discountPrice)) /
  //           Number(product.price)) *
  //           100
  //       )
  //     : 0;

  return (
    <div className="product-card-container relative bg-white shadow-sm hover:shadow-md rounded-lg overflow-hidden transition-all duration-300 group border border-gray-100">
      {/* Badge giảm giá */}
      {product.discountPrice && product.price > product.discountPrice && (
        <div className="product-discount-badge absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -
          {Math.round(
            ((product.price - product.discountPrice) / product.price) * 100
          )}
          %
        </div>
      )}

      {/* Link bao quanh hình ảnh */}
      <Link href={`/product/${product.slug}`} className="block relative h-64">
        {thumbnailImage ? (
          <div className="relative w-full h-full">
            <Image
              src={getFullImageUrl(thumbnailImage.url)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback khi ảnh lỗi
                const target = e.target as HTMLImageElement;
                target.src = "/images/product-placeholder.png";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">Không có ảnh</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        {/* Tên danh mục */}
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-amber-600 hover:text-amber-700 mb-1 inline-block"
          >
            {product.category.name}
          </Link>
        )}

        {/* Tên sản phẩm */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-800 mb-2 hover:text-amber-600 transition-colors line-clamp-2 h-12">
            {product.name}
          </h3>
        </Link>

        {/* Giá */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {product.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-red-600 font-medium">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="text-gray-400 text-sm line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-gray-800 font-medium">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Nút mua ngay */}
          <Link
            href={`/product/${product.slug}`}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Mua ngay
          </Link>
        </div>

        {/* Thêm thông tin lượt xem và số lượng đã bán */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {product.viewCount !== undefined && (
            <span>{product.viewCount} lượt xem</span>
          )}
          {product.saleCount !== undefined && product.saleCount > 0 && (
            <span>Đã bán {product.saleCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
