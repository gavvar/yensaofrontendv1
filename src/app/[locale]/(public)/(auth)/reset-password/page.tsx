"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/authService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  FiLock,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
} from "react-icons/fi";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Kiểm tra token có tồn tại không
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError(
        "Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới."
      );
    }
  }, [token]);

  // Kiểm tra mật khẩu mạnh
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      password
    );

    if (password.length < minLength) {
      return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    }

    let strengthCount = 0;
    if (hasUpperCase) strengthCount++;
    if (hasLowerCase) strengthCount++;
    if (hasNumber) strengthCount++;
    if (hasSpecialChar) strengthCount++;

    if (strengthCount < 3) {
      return {
        valid: false,
        message:
          "Mật khẩu phải chứa ít nhất 3 trong 4 loại: chữ hoa, chữ thường, số và ký tự đặc biệt",
      };
    }

    return { valid: true, message: "" };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Kiểm tra xác nhận mật khẩu
    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Kiểm tra mật khẩu mạnh
    const passwordCheck = validatePassword(passwordData.password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        token: token as string,
        password: passwordData.password,
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success("Mật khẩu đã được đặt lại thành công!");

        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 3000);
      } else {
        setError(
          response.data.message ||
            "Không thể đặt lại mật khẩu. Vui lòng thử lại."
        );
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          setError(
            "Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại."
          );
        } else {
          setError(
            err.response?.data?.error?.message ||
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

  // Hiển thị thông báo nếu token không hợp lệ
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <FiAlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Liên kết không hợp lệ
            </h2>
            <p className="mt-2 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/forgot-password"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Yêu cầu liên kết mới
            </Link>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center font-medium text-amber-600 hover:text-amber-500"
              >
                <FiArrowLeft className="mr-1" /> Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            Nhập mật khẩu mới để tiếp tục
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
                Đặt lại mật khẩu thành công
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được
                  chuyển hướng đến trang đăng nhập.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100700 mb-1"
                >
                  Mật khẩu mới
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
                    className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                    placeholder="Mật khẩu mới"
                    value={passwordData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Mật khẩu phải có ít nhất 8 ký tự và chứa chữ hoa, chữ thường,
                  số và ký tự đặc biệt.
                </p>
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
                    className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                    placeholder="Xác nhận mật khẩu"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  "Đặt lại mật khẩu"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center font-medium text-amber-600 hover:text-amber-500"
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
