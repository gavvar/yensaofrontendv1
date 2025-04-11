// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

// Tạo middleware cho xử lý đa ngôn ngữ
const intlMiddleware = createMiddleware({
  // Danh sách các ngôn ngữ được hỗ trợ
  locales,
  // Ngôn ngữ mặc định khi truy cập
  defaultLocale: "vi",
  // Tự động chuyển hướng sang ngôn ngữ ưa thích của trình duyệt
  localeDetection: true,
  localePrefix: "as-needed",
});

// Middleware xử lý các chuyển hướng thanh toán và kiểm tra session
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Xử lý chuyển hướng cho callback thanh toán
  if (path.startsWith("/callback/")) {
    // Lấy provider từ URL
    const provider = path.split("/")[2];

    // Tạo URL cho callback page trong app router
    const url = new URL(
      `/${request.nextUrl.locale}/(public)/checkout/callback/${provider}`,
      request.url
    );
    url.search = request.nextUrl.search;

    return NextResponse.rewrite(url);
  }

  // BỎ QUA TOÀN BỘ XỬ LÝ CHO ĐƯỜNG DẪN ADMIN
  if (path.startsWith("/admin")) {
    // Kiểm tra xác thực cho admin (tùy chọn)
    const isAuthenticated = request.cookies.has("accessToken");
    if (!isAuthenticated) {
      // Chuyển hướng đến trang đăng nhập với locale mặc định
      return NextResponse.redirect(
        new URL(`/vi/login?redirect=${path}`, request.url)
      );
    }
    return NextResponse.next();
  }

  // Xử lý đa ngôn ngữ cho các URL khác
  return intlMiddleware(request);
}

// Chỉ áp dụng middleware cho các route liên quan đến thanh toán
export const config = {
  matcher: [
    "/callback/:path*",
    "/checkout/:path*",
    "/((?!api|_next|.*\\..*).*)",
  ],
};
