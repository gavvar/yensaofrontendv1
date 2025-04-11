"use client";

import { ReactNode, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ToastContainer } from "react-toastify";
import { useParams } from "next/navigation";
import { AuthProvider } from "@/contexts/authContext";
import { CartProvider } from "@/contexts/CartContext";
import { Providers } from "@/contexts/ThemeProvider";
import { locales, Locale } from "@/i18n";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import css for toastify
import "react-toastify/dist/ReactToastify.css";

// Import messages
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

const messages = {
  vi: viMessages,
  en: enMessages,
};

// Client component with useParams
export default function ClientLayout({ children }: { children: ReactNode }) {
  // Sử dụng client-side hook để lấy locale
  const params = useParams();

  // Lấy locale từ params hoặc sử dụng giá trị mặc định
  const localeFromParams =
    typeof params?.locale === "string" ? params.locale : "vi";

  // Kiểm tra nếu locale không hợp lệ - sửa lỗi no-explicit-any
  const localeString = locales.includes(localeFromParams as Locale)
    ? localeFromParams
    : "vi";

  // Debug
  useEffect(() => {
    console.log("ClientLayout rendered with locale:", localeString);
  }, [localeString]);

  return (
    <NextIntlClientProvider
      locale={localeString}
      timeZone="Asia/Ho_Chi_Minh" // Thêm timeZone để tránh lỗi environment fallback
      messages={messages[localeString as keyof typeof messages] || messages.vi}
    >
      <Providers>
        <AuthProvider>
          <CartProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
            <ToastContainer position="top-right" autoClose={3000} />
          </CartProvider>
        </AuthProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
