"use client";

import { useState, useEffect } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";

// Components can be moved to separate files later
import ProductCard from "@/components/products/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulating data fetch - replace with actual API call later
  useEffect(() => {
    // This will be replaced with actual API call
    const mockFetch = async () => {
      // Simulating network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    };

    mockFetch();
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
            <div className="relative w-full h-full bg-amber-100">
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
              {/* Image placeholder - replace with actual image */}
              <div className="bg-amber-200 w-full h-full flex items-center justify-center">
                <span className="text-amber-800 text-xl">
                  Hình ảnh banner 1
                </span>
              </div>
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
            <div className="relative w-full h-full bg-amber-50">
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
              {/* Image placeholder - replace with actual image */}
              <div className="bg-amber-100 w-full h-full flex items-center justify-center">
                <span className="text-amber-800 text-xl">
                  Hình ảnh banner 2
                </span>
              </div>
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
            {/* Empty state when API is not integrated yet */}
            {featuredProducts.length === 0 && (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="h-48 bg-amber-100 flex items-center justify-center">
                <span className="text-amber-800">Hình ảnh yến thô</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Yến Thô</h3>
                <p className="text-gray-600 mb-4">
                  Tổ yến nguyên chất từ thiên nhiên, chưa qua chế biến
                </p>
                <Link
                  href="/products/raw-nest"
                  className="text-amber-600 font-medium hover:text-amber-700"
                >
                  Khám phá →
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="h-48 bg-amber-100 flex items-center justify-center">
                <span className="text-amber-800">Hình ảnh yến tinh chế</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Yến Tinh Chế</h3>
                <p className="text-gray-600 mb-4">
                  Tổ yến đã qua xử lý sạch lông, tạp chất, sẵn sàng chế biến
                </p>
                <Link
                  href="/products/processed-nest"
                  className="text-amber-600 font-medium hover:text-amber-700"
                >
                  Khám phá →
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="h-48 bg-amber-100 flex items-center justify-center">
                <span className="text-amber-800">Hình ảnh yến chưng sẵn</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Yến Chưng Sẵn</h3>
                <p className="text-gray-600 mb-4">
                  Sản phẩm yến sào đã chế biến, tiện lợi sử dụng ngay
                </p>
                <Link
                  href="/products/ready-to-eat"
                  className="text-amber-600 font-medium hover:text-amber-700"
                >
                  Khám phá →
                </Link>
              </div>
            </motion.div>
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
    </main>
  );
}
