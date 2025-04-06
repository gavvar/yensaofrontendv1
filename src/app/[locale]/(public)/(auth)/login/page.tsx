"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { login, error, clearError, isAuthenticated } = useAuth(); //user
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    try {
      // Lưu kết quả login để kiểm tra
      const userData = await login(email, password, rememberMe);
      console.log("Login successful, user data:", userData);

      if (userData) {
        toast.success("Đăng nhập thành công!");

        // Chuyển hướng ngay lập tức
        if (userData.role === "admin") {
          console.log("Redirecting to admin dashboard immediately");
          router.push("/admin");
        } else {
          console.log("Redirecting to home page immediately");
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      // Lỗi đã được xử lý trong useAuth
    } finally {
      setLoading(false);
      setIsSubmitted(false); // Vô hiệu hóa useEffect
    }
  };

  // Vô hiệu hóa useEffect để tránh chuyển hướng kép
  useEffect(() => {
    // Chỉ giữ lại xử lý lỗi
    if (isSubmitted && !loading && error) {
      toast.error(error);
      setIsSubmitted(false);
    }
  }, [error, loading, isSubmitted]);

  useEffect(() => {
    // Xóa trạng thái tự động chuyển hướng nếu đã ở trang login
    if (isAuthenticated) {
      router.push("/");
      return;
    }

    // Chỉ kiểm tra session nếu không phải chuyển hướng tự nguyện
    const searchParams = new URLSearchParams(window.location.search);
    const sessionExpired = searchParams.get("session") === "expired";
    const isFromHeader = searchParams.get("from") === "header"; // thêm param from=header khi click Login

    if (sessionExpired && !isFromHeader) {
      // Hiển thị thông báo session expired
      toast.info("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");

      // Xóa query param để tránh thông báo lặp lại khi refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-900 dark:text-gray-100">
            Hoặc{" "}
            <Link
              href="/register"
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              tạo tài khoản mới
            </Link>
          </p>
        </div>

        {resetSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu
            mới.
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
