"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

export function useRequireAuth(
  redirectUrl = "/login",
  requiredRole?: "admin" | "customer" // Thay đổi từ "user" thành "customer"
) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Skip if still loading or already redirecting
    if (authLoading || redirecting) {
      return;
    }

    // Skip if already checked and authorized
    if (hasCheckedAuth.current && isAuthorized) {
      return;
    }

    // Debug output to help track issues
    console.log("Auth check:", { user, requiredRole });

    // Check if user is logged in
    if (!user) {
      setRedirecting(true);
      console.log("Not logged in, redirecting to:", redirectUrl);
      router.push(redirectUrl);
      return;
    }

    // Check role requirements if specified
    if (requiredRole && user.role !== requiredRole) {
      setRedirecting(true);
      console.log(`Required role: ${requiredRole}, User role: ${user.role}`);
      router.push("/unauthorized");
      return;
    }

    // User is authorized
    setIsAuthorized(true);
    hasCheckedAuth.current = true;
  }, [
    user,
    authLoading,
    router,
    redirectUrl,
    requiredRole,
    redirecting,
    isAuthorized,
  ]);

  return { isAuthorized, loading: authLoading || redirecting, user };
}
