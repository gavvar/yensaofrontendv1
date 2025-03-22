// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/authService";
import { toast } from "react-toastify";
import { AxiosError } from "axios"; // Import AxiosError

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await forgotPassword({ email });

      if (response.data.success) {
        setSuccess(true);
        toast.success("Email khôi phục mật khẩu đã được gửi!");
      } else {
        setError(response.data.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err: unknown) {
      // Thay any bằng unknown
      // Type guard kiểm tra xem lỗi có phải là AxiosError không
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Có lỗi xảy ra, vui lòng thử lại"
        );
      } else {
        // Xử lý các loại lỗi khác
        setError("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Kiểm tra email của bạn
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của
                    bạn. Vui lòng kiểm tra hộp thư đến.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-amber-600 hover:text-amber-500"
                  >
                    Quay lại trang đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

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
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Gửi email khôi phục"}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
