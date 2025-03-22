"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

export function useRequireAuth(
  redirectUrl = "/login",
  requiredRole?: "admin" | "user"
) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // Theo dõi trạng thái redirect
  const hasCheckedAuth = useRef(false); // Đảm bảo chỉ kiểm tra một lần nếu đã xác thực

  useEffect(() => {
    // Chỉ kiểm tra khi đã tải xong thông tin user và chưa redirect
    if (!loading && !redirecting && !hasCheckedAuth.current) {
      // Kiểm tra xác thực
      if (!user) {
        setRedirecting(true);
        console.log("Chưa đăng nhập, chuyển hướng đến:", redirectUrl);
        router.push(redirectUrl);
        return;
      }

      // Kiểm tra phân quyền
      if (requiredRole && user.role !== requiredRole) {
        setRedirecting(true);
        console.log("Không đủ quyền, chuyển hướng đến: /unauthorized");
        router.push("/unauthorized");
        return;
      }

      // Đã xác thực và có đủ quyền
      setIsAuthorized(true);
      hasCheckedAuth.current = true; // Đánh dấu đã kiểm tra xong
    }

    // Reset redirecting state nếu user hoặc loading thay đổi
    if (user && redirecting) {
      setRedirecting(false);
    }
  }, [user, loading, router, redirectUrl, requiredRole, redirecting]);

  return { isAuthorized, loading: loading || redirecting, user };
}
