"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { MdLanguage } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { locales } from "@/i18n";

// Định nghĩa kiểu cho locales để tránh dùng any
type Locale = "vi" | "en";

export default function LanguageSwitcher() {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Lấy locale hiện tại từ URL
  const getCurrentLocale = (): Locale => {
    const pathSegments = pathname.split("/");
    // Locale luôn là phần tử thứ 1 trong path (sau /)
    const currentLocale = pathSegments[1];

    // Kiểm tra xem locale có hợp lệ không
    if (locales.includes(currentLocale as Locale)) {
      return currentLocale as Locale;
    }

    // Mặc định là vi
    return "vi";
  };

  // Xử lý click bên ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý chuyển đổi ngôn ngữ
  const handleLanguageChange = (locale: Locale) => {
    const currentLocale = getCurrentLocale();

    // Không thực hiện nếu đang ở cùng locale
    if (currentLocale === locale) {
      setIsLangMenuOpen(false);
      return;
    }

    // Lấy phần đường dẫn sau locale
    const pathSegments = pathname.split("/");

    // Loại bỏ locale hiện tại và tạo đường dẫn mới
    pathSegments[1] = locale;
    const newPath = pathSegments.join("/");

    // Chuyển hướng đến URL mới với locale mới
    router.push(newPath);
    setIsLangMenuOpen(false);
  };

  // Sử dụng currentLocale trong render, để tránh lỗi "never read"
  const activeLocale = getCurrentLocale();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
        className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
        aria-label="Change language"
      >
        <MdLanguage size={20} />
        <span className="ml-1 text-sm font-medium uppercase">
          {activeLocale}
        </span>
      </button>

      <AnimatePresence>
        {isLangMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-50 border border-gray-100 dark:border-gray-700"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  activeLocale === locale
                    ? "text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20"
                    : "text-gray-800 dark:text-gray-200"
                }`}
                onClick={() => handleLanguageChange(locale as Locale)}
              >
                {locale === "vi" ? "Tiếng Việt" : "English"}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
