"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";

// Imports
import categoryService from "@/services/categoryService";
import productService from "@/services/productService";
import { Category } from "@/services/categoryService";
import { Product } from "@/types/product";
// import { formatCurrency } from "@/utils/format";
import ProductCard from "@/components/user/ProductCard";
import { getFullImageUrl } from "@/utils/image";
import ImageUrlChecker from "@/components/debug/ImageUrlChecker";

// Components can be moved to separate files later
const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="text-center mb-10">
    <h2 className="text-3xl font-bold mb-3">{title}</h2>
    <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
  </div>
);

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        // Sử dụng API mới cho sản phẩm nổi bật
        const products = await productService.getFeaturedProducts(4);

        // Log để kiểm tra dữ liệu
        console.log("Featured products loaded:", products);

        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);

        // Không làm gì thêm, UI đã xử lý trường hợp không có dữ liệu
      } finally {
        setLoading(false);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const rootCategories = await categoryService.getRootCategories();
        // Lấy tối đa 3 danh mục để hiển thị
        setCategories(rootCategories.slice(0, 3));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] max-h-[600px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="w-full h-full"
        >
          <SwiperSlide>
            <div className="relative w-full h-full">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />

              {/* Banner image */}
              <Image
                src="/images/banner.jpg"
                alt="Yến sào chất lượng cao"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* Content overlay */}
              <div className="absolute top-1/2 left-14 transform -translate-y-1/2 z-20 text-white max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Yến Sào Chất Lượng Cao
                </h1>
                <p className="text-lg mb-6">
                  Nguồn dinh dưỡng quý giá từ thiên nhiên, được chọn lọc kỹ
                  lưỡng
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative w-full h-full">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />

              {/* Banner image */}
              <Image
                src="/images/banner2.jpg" // Giả sử bạn có banner2.jpg
                alt="Sản phẩm yến chưng sẵn"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* Content overlay */}
              <div className="absolute top-1/2 left-14 transform -translate-y-1/2 z-20 text-white max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Sản Phẩm Yến Chưng Sẵn
                </h1>
                <p className="text-lg mb-6">
                  Tiện lợi, bổ dưỡng và phù hợp với nhịp sống hiện đại
                </p>
                <Link
                  href="/products/ready-to-eat"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Xem ngay
                </Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <SectionTitle
          title="Sản Phẩm Nổi Bật"
          subtitle="Khám phá những sản phẩm yến sào chất lượng cao"
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              // Placeholder khi không có sản phẩm nổi bật
              <>
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white shadow-md rounded-lg p-4 border border-gray-100"
                  >
                    <div className="bg-gray-100 h-64 rounded-md flex items-center justify-center mb-4">
                      <span className="text-gray-400">Hình ảnh sản phẩm</span>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <button className="bg-amber-600 text-white px-4 py-2 rounded-md">
                        Mua ngay
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-amber-50">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <SectionTitle
            title="Danh Mục Sản Phẩm"
            subtitle="Khám phá các dòng sản phẩm yến sào đa dạng"
          />

          {categoriesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="h-48 bg-amber-100 flex items-center justify-center relative">
                      {category.imageUrl ? (
                        <Image
                          src={getFullImageUrl(category.imageUrl)}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          id={`cat-img-${category.id}`}
                          onError={() => {
                            // Xử lý lỗi ảnh (tùy chọn)
                            const imgElement = document.getElementById(
                              `cat-img-${category.id}`
                            );
                            if (imgElement) {
                              imgElement.style.display = "none";
                            }
                          }}
                        />
                      ) : (
                        <span className="text-amber-800">{category.name}</span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {category.description || "Khám phá sản phẩm chất lượng"}
                      </p>
                      <Link
                        href={`/categories/${category.slug}`}
                        className="text-amber-600 font-medium hover:text-amber-700"
                      >
                        Khám phá →
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">Không có danh mục nào</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-block border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Xem tất cả danh mục
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Về Yến Sào Của Chúng Tôi
            </h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi tự hào mang đến những sản phẩm yến sào chất lượng cao,
              được thu hoạch và chế biến theo quy trình nghiêm ngặt, đảm bảo giữ
              nguyên giá trị dinh dưỡng và hương vị tự nhiên.
            </p>
            <p className="text-gray-600 mb-6">
              Với hơn 10 năm kinh nghiệm trong lĩnh vực yến sào, chúng tôi cam
              kết mang đến những sản phẩm chất lượng, an toàn và giàu dinh dưỡng
              cho sức khỏe của bạn và gia đình.
            </p>
            <Link
              href="/about"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Tìm hiểu thêm
            </Link>
          </div>
          <div className="bg-amber-100 h-96 rounded-lg flex items-center justify-center">
            <span className="text-amber-800 text-xl">Hình ảnh giới thiệu</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-amber-50">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <SectionTitle
            title="Khách Hàng Nói Gì Về Chúng Tôi"
            subtitle="Trải nghiệm và đánh giá từ khách hàng thân thiết"
          />

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            navigation
            pagination={{ clickable: true }}
            className="mt-10"
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <SwiperSlide key={item}>
                <div className="bg-white p-6 rounded-xl shadow-sm mb-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-amber-200 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-medium">Khách hàng {item}</h4>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Sản phẩm yến sào chất lượng, giao hàng nhanh chóng. Tôi rất
                    hài lòng với dịch vụ và sẽ tiếp tục ủng hộ.
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {process.env.NODE_ENV === "development" && (
        <div className="container mx-auto mt-12 px-4">
          <ImageUrlChecker />
        </div>
      )}
    </main>
  );
}
