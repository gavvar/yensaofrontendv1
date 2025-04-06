"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Định nghĩa cấu trúc dữ liệu cho banner slides
type BannerSlide = {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
};

export default function HeroSection() {
  // Dữ liệu slides - có thể đưa ra ngoài thành props hoặc API call
  const bannerSlides: BannerSlide[] = [
    {
      id: 1,
      imageUrl: "/images/banner.png",
      title: "Yến Sào Thủ Đức",
      subtitle:
        "Cung cấp các sản phẩm yến sào tự nhiên, nguyên chất, đảm bảo chất lượng",
      primaryButtonText: "Mua ngay",
      primaryButtonUrl: "/products",
      secondaryButtonText: "Tìm hiểu thêm",
      secondaryButtonUrl: "/about",
    },
    {
      id: 2,
      imageUrl: "/images/banner.jpg",
      title: "Sản Phẩm Cao Cấp",
      subtitle: "Trải nghiệm sản phẩm yến sào cao cấp với hương vị tự nhiên",
      primaryButtonText: "Xem bộ sưu tập",
      primaryButtonUrl: "/products",
    },
    {
      id: 3,
      imageUrl: "/images/banner2.jpg",
      title: "Ưu Đãi Đặc Biệt",
      subtitle: "Nhập mã 'SUMMER' 10% tối đa 200 000 Từ 1/4-30/4",
      primaryButtonText: "Khám phá ngay",
      primaryButtonUrl: "/products",
    },
  ];

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        loop={true}
        className="h-[80vh]"
      >
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[80vh] bg-black">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority
                className="object-cover opacity-80 dark:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent dark:from-black/80"></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 hero-text">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 hero-subtitle">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {slide.primaryButtonText && (
                    <Link
                      href={slide.primaryButtonUrl || "#"}
                      className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-md transition-colors"
                    >
                      {slide.primaryButtonText}
                    </Link>
                  )}
                  {slide.secondaryButtonText && (
                    <Link
                      href={slide.secondaryButtonUrl || "#"}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-md transition-colors"
                    >
                      {slide.secondaryButtonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
