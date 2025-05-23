"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiChevronRight,
} from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import productService from "@/services/productService";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { getFullImageUrl } from "@/utils/image";
import ProductCard from "@/components/user/ProductCard";
import { useCart } from "@/contexts/CartContext";

// Thêm function để tạo mô tả ngắn từ mô tả đầy đủ
const createShortDescription = (description: string) => {
  // Loại bỏ các thẻ HTML
  const plainText = description.replace(/<[^>]*>/g, "");

  // Giới hạn số ký tự (ví dụ: 150 ký tự)
  return plainText.length > 150
    ? plainText.substring(0, 150) + "..."
    : plainText;
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("description");

  const { addToCart } = useCart();

  // Fetch product and related products
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // 1. Fetch product details first
        const productData = await productService.getProductBySlug(slug);
        setProduct(productData);

        // Set the featured image
        if (productData.images && productData.images.length > 0) {
          const featuredImage =
            productData.images.find((img) => img.isFeatured) ||
            productData.images[0];
          setSelectedImage(getFullImageUrl(featuredImage.url));
        }

        // Only proceed if we have a valid product with ID
        if (productData && productData.id) {
          // 2. Record the view (non-blocking)
          productService.updateProductView(productData.id).catch((err) => {
            console.error("Non-critical: Failed to record view", err);
          });

          // 3. Fetch related products
          try {
            const related = await productService.getRelatedProducts(
              productData.id,
              4
            );
            setRelatedProducts(related);
          } catch (relatedError) {
            console.error("Error fetching related products:", relatedError);
            setRelatedProducts([]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    // Kiểm tra product tồn tại trước khi truy cập properties
    if (!product) {
      console.error("Cannot add to cart: Product is null");
      return;
    }

    try {
      // Thay null bằng undefined hoặc ""
      await addToCart(product.id, quantity, "");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    // Implement buy now functionality here
    console.log(`Buying ${quantity} of ${product?.name} now`);
    // TODO: Buy now logic
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sản phẩm không tồn tại</h1>
          <p className="text-gray-900 dark:text-gray-200 mb-8">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            href="/products"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            Quay lại trang sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discount percentage if discountPrice exists
  const discountPercentage =
    product.discountPrice && product.price
      ? Math.round(
          ((Number(product.price) - Number(product.discountPrice)) /
            Number(product.price)) *
            100
        )
      : 0;

  // Get the featured image or first image
  const featuredImage =
    product.images?.find((img) => img.isFeatured) || product.images?.[0];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-6">
          <Link
            href="/"
            className="hover:text-amber-600 dark:hover:text-amber-400"
          >
            Trang chủ
          </Link>
          <FiChevronRight className="mx-2" />
          <Link
            href="/products"
            className="hover:text-amber-600 dark:hover:text-amber-400"
          >
            Sản phẩm
          </Link>
          {product.category && (
            <>
              <FiChevronRight className="mx-2" />
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-amber-600 dark:hover:text-amber-400"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <FiChevronRight className="mx-2" />
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {product.name}
          </span>
        </div>

        {/* Product Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              {/* Main Image */}
              <div className="relative h-96 mb-4 border rounded-lg overflow-hidden">
                <Image
                  src={
                    selectedImage || getFullImageUrl(featuredImage?.url || "")
                  }
                  alt={product.name}
                  fill
                  className="object-contain"
                />
                {discountPercentage > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative h-20 border dark:border-gray-700 rounded-md overflow-hidden cursor-pointer ${
                        selectedImage === getFullImageUrl(image.url)
                          ? "border-amber-500 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-gray-800"
                          : "hover:opacity-80"
                      }`}
                      onClick={() =>
                        setSelectedImage(getFullImageUrl(image.url))
                      }
                    >
                      <Image
                        src={getFullImageUrl(image.url)}
                        alt={`${product.name} - Hình ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold mb-2 dark:text-white">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-4 mb-6">
                {product.discountPrice ? (
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-500 mr-2">
                      {formatCurrency(product.discountPrice)}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="ml-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                        Tiết kiệm {discountPercentage}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <div className="mb-6 text-gray-700 dark:text-gray-300">
                {product.description
                  ? createShortDescription(product.description)
                  : "Không có mô tả ngắn"}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Số lượng
                </label>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    className="text-gray-700 dark:text-gray-300 focus:outline-none focus:text-gray-900 dark:focus:text-white p-2 border dark:border-gray-700 rounded-l-md"
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="number"
                    className="h-10 w-16 border-t border-b dark:border-gray-700 text-center bg-white dark:bg-gray-800 dark:text-white"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="text-gray-700 dark:text-gray-300 focus:outline-none focus:text-gray-900 dark:focus:text-white p-2 border dark:border-gray-700 rounded-r-md"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white py-3 px-4 rounded-md flex items-center justify-center"
                >
                  <FiShoppingCart className="mr-2" /> Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-3 px-4 rounded-md flex items-center justify-center"
                >
                  Mua ngay
                </button>
              </div>

              {/* Additional Actions */}
              <div className="flex space-x-4 text-gray-700 dark:text-gray-300">
                <button className="flex items-center hover:text-amber-600 dark:hover:text-amber-400">
                  <FiHeart className="mr-1" /> Yêu thích
                </button>
                <button className="flex items-center hover:text-amber-600 dark:hover:text-amber-400">
                  <FiShare2 className="mr-1" /> Chia sẻ
                </button>
              </div>

              {/* Product Meta Information */}
              <div className="mt-8 border-t dark:border-gray-700 pt-4 space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 w-32">
                    Mã sản phẩm:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {product.sku || "N/A"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 w-32">
                    Danh mục:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {product.category ? (
                      <Link
                        href={`/categories/${product.category.slug}`}
                        className="text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        {product.category.name}
                      </Link>
                    ) : (
                      "Không có danh mục"
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 w-32">
                    Trạng thái:
                  </span>
                  <span
                    className={
                      product.status === "active"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {product.status === "active" ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="px-6 pb-6">
            <div className="border-b dark:border-gray-700">
              <div className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`mr-8 py-4 text-sm font-medium ${
                    activeTab === "description"
                      ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                >
                  Mô tả sản phẩm
                </button>
                <button
                  onClick={() => setActiveTab("specification")}
                  className={`mr-8 py-4 text-sm font-medium ${
                    activeTab === "specification"
                      ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                >
                  Thông số kỹ thuật
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`mr-8 py-4 text-sm font-medium ${
                    activeTab === "reviews"
                      ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                >
                  Đánh giá
                </button>
              </div>
            </div>

            <div className="py-6">
              {activeTab === "description" && (
                <div className="prose max-w-none dark:prose-invert dark:text-gray-300">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description ||
                        "<p>Không có mô tả chi tiết.</p>",
                    }}
                  />
                </div>
              )}

              {activeTab === "specification" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 dark:text-white">
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 py-2 border-b dark:border-gray-600">
                        <div className="text-gray-700 dark:text-gray-300">
                          Xuất xứ
                        </div>
                        <div className="dark:text-white">Việt Nam</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2 border-b dark:border-gray-600">
                        <div className="text-gray-700 dark:text-gray-300">
                          Thương hiệu
                        </div>
                        <div className="dark:text-white">YensaoVN</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2 border-b dark:border-gray-600">
                        <div className="text-gray-700 dark:text-gray-300">
                          Khối lượng
                        </div>
                        <div className="dark:text-white">100g</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-2 border-b dark:border-gray-600">
                        <div className="text-gray-700 dark:text-gray-300">
                          Hạn sử dụng
                        </div>
                        <div className="dark:text-white">
                          12 tháng kể từ ngày sản xuất
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 dark:text-white">
                      Hướng dẫn sử dụng
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Bảo quản ở nơi khô ráo, thoáng mát</li>
                      <li>Tránh ánh nắng trực tiếp</li>
                      <li>Đóng kín sau khi sử dụng</li>
                      <li>Tham khảo hướng dẫn chi tiết trong bao bì</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2 dark:text-white">
                      Đánh giá sản phẩm
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Hiện chưa có đánh giá nào cho sản phẩm này
                    </p>
                    <button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white py-2 px-4 rounded-md">
                      Viết đánh giá
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
