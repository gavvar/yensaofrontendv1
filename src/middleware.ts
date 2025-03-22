// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Lấy path hiện tại
  const path = request.nextUrl.pathname;

  // Các path công khai không cần xác thực
  const isPublicPath =
    path === "/login" || path === "/register" || path === "/forgot-password";

  // Lấy token từ cookies hoặc headers
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.split(" ")[1];

  console.log(
    `Middleware check: Path=${path}, Public=${isPublicPath}, HasToken=${!!token}`
  );

  // Nếu đang truy cập trang admin
  if (path.startsWith("/admin")) {
    // Kiểm tra session storage không khả thi trong middleware,
    // nên ta chỉ có thể kiểm tra token
    if (!token) {
      console.log("No token, redirecting from admin to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Nếu có token, cho phép truy cập
    return NextResponse.next();
  }

  // Nếu đã có token và đang truy cập trang login/register, chuyển hướng đến home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Các trường hợp khác, cho phép truy cập
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn cần kiểm tra
export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/admin/:path*"],
};
