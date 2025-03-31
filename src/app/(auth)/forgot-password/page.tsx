// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/authService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { FiMail, FiArrowLeft } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Handle countdown if success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    if (!validateEmail(email)) {
      setError("Địa chỉ email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ email });

      if (response.data.success) {
        setSuccess(true);
        setCooldown(60); // 60 second cooldown
        toast.success("Email khôi phục mật khẩu đã được gửi!");
      } else {
        setError(response.data.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          setError("Email này chưa được đăng ký trong hệ thống");
        } else {
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Có lỗi xảy ra, vui lòng thử lại"
          );
        }
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    try {
      const response = await forgotPassword({ email });

      if (response.data.success) {
        setCooldown(60);
        toast.success("Email khôi phục mật khẩu đã được gửi lại!");
      }
    } catch (err) {
      toast.error("Không thể gửi lại email. Vui lòng thử lại sau.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-900">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu. Email khôi
            phục sẽ có hiệu lực trong 1 giờ.
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-6 border border-green-100">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-800">
                Kiểm tra email của bạn
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{" "}
                  <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến và thư
                  rác.
                </p>
                <p className="mt-2">
                  Email có hiệu lực trong 1 giờ. Nếu bạn không nhận được email,
                  hãy kiểm tra thư rác hoặc thử gửi lại sau khi hết thời gian
                  chờ.
                </p>
              </div>

              <div className="mt-6 space-y-4 w-full">
                <button
                  onClick={handleResendEmail}
                  disabled={cooldown > 0 || loading}
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cooldown > 0
                    ? `Gửi lại sau ${cooldown}s`
                    : loading
                    ? "Đang gửi..."
                    : "Gửi lại email khôi phục"}
                </button>

                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  <span className="flex items-center justify-center">
                    <FiArrowLeft className="mr-2" />
                    Quay lại trang đăng nhập
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-900" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  </>
                ) : (
                  "Gửi email khôi phục"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center font-medium text-amber-600 hover:text-amber-500 transition-colors"
                >
                  <FiArrowLeft className="mr-1" /> Quay lại trang đăng nhập
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
