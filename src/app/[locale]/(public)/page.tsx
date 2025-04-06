"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// Imports
import categoryService from "@/services/categoryService";
import productService from "@/services/productService";
import { Category } from "@/services/categoryService";
import { Product } from "@/types/product";
import ProductCard from "@/components/user/ProductCard";
import { getFullImageUrl } from "@/utils/image";
import HeroSection from "@/components/home/HeroSection";

// Components can be moved to separate files later
const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="text-center mb-10">
    <h2 className="text-3xl font-bold mb-3 dark:text-white">{title}</h2>
    <p className="text-gray-900 dark:text-gray-200 max-w-2xl mx-auto">
      {subtitle}
    </p>
  </div>
);

export default function HomePage() {
  // Sử dụng hooks useTranslations cho các đoạn văn bản
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const tt = useTranslations("testimonials");

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getFeaturedProducts(4);
        console.log("Featured products loaded:", products);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
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
      {/* Sử dụng HeroSection mới */}
      <HeroSection />

      {/* Featured Products - phần còn lại giữ nguyên */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <SectionTitle
          title={t("featuredProducts")}
          subtitle={t("featuredSubtitle")}
        />

        {/* ... Phần còn lại của Featured Products ... */}
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
                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded-md flex items-center justify-center mb-4">
                      <span className="text-gray-900 dark:text-gray-200">
                        {tc("products")}
                      </span>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                      <button className="bg-amber-600 text-white px-4 py-2 rounded-md">
                        {t("shopNow")}
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
            href="products"
            className="inline-block border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            {t("viewAllProducts")}
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-amber-50 dark:bg-gray-800">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <SectionTitle
            title={tc("categories")}
            subtitle={t("categoriesSubtitle")}
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
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="h-48 bg-amber-100 dark:bg-gray-600 flex items-center justify-center relative">
                      {category.imageUrl ? (
                        <Image
                          src={getFullImageUrl(category.imageUrl)}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          id={`cat-img-${category.id}`}
                          onError={() => {
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
                      <h3 className="text-xl font-semibold mb-2 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-gray-900 dark:text-gray-200 mb-4">
                        {category.description || t("categoriesSubtitle")}
                      </p>
                      <Link
                        href={`/categories/${category.slug}`}
                        className="text-amber-600 font-medium hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        {t("exploreNow")} →
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-900 dark:text-gray-200">
                    {t("noCategories")}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-block border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {tc("seeAll")} {tc("categories").toLowerCase()}
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              {tc("about")} {t("heroTitle")}
            </h2>
            <p className="text-gray-900 dark:text-gray-200 mb-4">
              {t("aboutDesc1")}
            </p>
            <p className="text-gray-900 dark:text-gray-200 mb-6">
              {t("aboutDesc2")}
            </p>
            <Link
              href="/about"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              {t("learnMore")}
            </Link>
          </div>
          <div className="bg-amber-100 h-96 rounded-lg flex items-center justify-center">
            <span className="text-amber-800 text-xl">{t("aboutImage")}</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-amber-50 dark:bg-gray-800">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <SectionTitle title={tt("title")} subtitle={tt("subtitle")} />

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
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm mb-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-amber-200 dark:bg-amber-900/40 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-medium dark:text-white">
                        {tt("customer")} {item}
                      </h4>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-gray-200">
                    {tt("feedback")}
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
