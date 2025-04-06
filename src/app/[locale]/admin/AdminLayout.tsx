"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";
import { Locale, locales } from "@/i18n";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const messages = {
  vi: viMessages,
  en: enMessages,
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const params = useParams();
  const locale = (
    typeof params?.locale === "string" ? params.locale : "vi"
  ) as Locale;

  // Kiểm tra nếu locale không hợp lệ
  const localeString = locales.includes(locale) ? locale : "vi";

  // Thêm effect listener cho sự kiện session expired
  useEffect(() => {
    const handleSessionExpired = () => {
      router.push(`/${localeString}/login?session=expired`);
    };

    window.addEventListener("auth:sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:sessionExpired", handleSessionExpired);
    };
  }, [router, localeString]);

  // Chuyển hướng nếu không phải admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push(`/${localeString}/login?redirect=/${localeString}/admin`);
    }
  }, [user, loading, router, localeString]);

  // Nếu đang loading hoặc không có user, không hiển thị gì
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Nếu không phải admin, không hiển thị nội dung
  if (user.role !== "admin") {
    return null;
  }

  return (
    <NextIntlClientProvider
      locale={localeString}
      timeZone="Asia/Ho_Chi_Minh"
      messages={messages[localeString as keyof typeof messages] || messages.vi}
    >
      {children}
      <ToastContainer position="top-right" autoClose={5000} />
    </NextIntlClientProvider>
  );
}
