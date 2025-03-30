// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Lấy path hiện tại
  const path = request.nextUrl.pathname;

  // Các path công khai không cần xác thực
  const isPublicPath =
    path === "/login" || path === "/register" || path === "/forgot-password";

  // Kiểm tra xem có cookie accessToken không (HTTP-only cookie)
  const isAuthenticated = request.cookies.has("accessToken");

  console.log(
    `Middleware check: Path=${path}, Public=${isPublicPath}, IsAuthenticated=${isAuthenticated}`
  );

  // Nếu đang truy cập trang admin
  if (path.startsWith("/admin")) {
    // Kiểm tra xác thực thông qua cookie accessToken
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting from admin to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Nếu đã xác thực, cho phép truy cập
    return NextResponse.next();
  }

  // Nếu đã xác thực và đang truy cập trang login/register, chuyển hướng đến home
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Các trường hợp khác, cho phép truy cập
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn cần kiểm tra
export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/admin/:path*"],
};
