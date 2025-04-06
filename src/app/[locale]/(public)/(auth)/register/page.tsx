// src/app/(auth)/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterPage() {
  const { register, error, clearError } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear errors when fields change
  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [fullName, email, password, confirmPassword, clearError]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Validate name
    if (fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Email không hợp lệ";
    }

    // Validate password strength
    if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Mật khẩu phải có ít nhất 1 chữ in hoa";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Mật khẩu phải có ít nhất 1 chữ số";
    }

    // Validate password match
    if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password);
      toast.success("Đăng ký thành công! Chuyển hướng đến trang chủ...");

      // Delay redirect slightly to show the success message
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      // Errors are handled in useAuth hook
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            Hoặc{" "}
            <Link
              href="/login"
              className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
            >
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.fullName
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.email
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    validationErrors.password
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 focus:outline-none"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    validationErrors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
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
                "Đăng ký"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
