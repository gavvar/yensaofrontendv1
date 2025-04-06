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

// Middleware tổng hợp
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Ngăn chặn vòng lặp redirect bằng cách kiểm tra xem URL đã có locale chưa
  const pathnameHasLocale = locales.some(
    (locale) => path.startsWith(`/${locale}/`) || path === `/${locale}`
  );

  // Nếu URL đã có locale và là URL root của locale, không cần redirect nữa
  if (pathnameHasLocale) {
    // Kiểm tra đường dẫn admin và xác thực
    const isAdminPath = path.includes("/admin");
    const isAuthenticated = request.cookies.has("accessToken");

    // Kiểm tra đường dẫn công khai
    const publicPaths = ["/login", "/register", "/forgot-password"];
    const isPublicPath = publicPaths.some(
      (prefix) => path.endsWith(prefix) || path.includes(`${prefix}/`)
    );

    console.log(
      `Middleware check: Path=${path}, Public=${isPublicPath}, IsAuthenticated=${isAuthenticated}`
    );

    // Logic chuyển hướng khác (admin, login, etc.)
    if (isAdminPath && !isAuthenticated) {
      const locale = path.split("/")[1];
      const loginUrl = `/${locale}/login`;
      console.log("Not authenticated, redirecting from admin to login");
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    if (isPublicPath && isAuthenticated) {
      const locale = path.split("/")[1];
      const homeUrl = `/${locale}`;
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // Nếu không cần chuyển hướng, trả về kết quả next()
    return NextResponse.next();
  }

  // Xử lý đa ngôn ngữ cho các URL chưa có locale
  return intlMiddleware(request);
}

export const config = {
  // Chặn tất cả các đường dẫn ngoại trừ các đường dẫn cho static assets
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
