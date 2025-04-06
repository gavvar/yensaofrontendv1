import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Định nghĩa các locale được hỗ trợ
export const locales = ["en", "vi"] as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale: locale as Locale, // Type assertion để đảm bảo TypeScript biết locale là non-null và có kiểu cụ thể

    // Thêm cấu hình timeZone để tránh lỗi ENVIRONMENT_FALLBACK
    timeZone: "Asia/Ho_Chi_Minh",

    // Thêm cấu hình các tùy chọn định dạng mặc định
    defaultTranslationValues: {
      // Thêm kiểu dữ liệu cho tham số value
      price: (value: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value),
    },

    // Tiếp tục sử dụng các messages từ file json
    messages: (await import(`./messages/${locale}.json`)).default as Record<
      string,
      Record<string, string>
    >,
  };
});
