"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { loginUser } from "@/services/authService";
import Link from "next/link";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await loginUser(data);
      const user = response.data.user;
      localStorage.setItem("token", response.data.token);
      if (user.role === "admin") {
        toast.success("Đăng nhập thành công!");
        router.push("/admin");
      } else {
        toast.success("Đăng nhập thành công!");
        router.push("/");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Đăng nhập thất bại";
        toast.error(errorMessage);
        console.log("Error response:", error.response?.data);
      } else {
        toast.error("Đăng nhập thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left column - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-10">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">Yến Sào Việt Nam</h1>
          <p className="text-xl mb-8">
            Chào mừng quý khách trở lại với hệ thống của chúng tôi
          </p>
          <div className="w-32 h-32 rounded-full bg-white/10 mx-auto flex items-center justify-center">
            <FiUser className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Right column - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 relative">
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="px-3 py-2 bg-gray-100">
                  <FiMail className="text-gray-500" />
                </div>
                <input
                  {...register("email", {
                    required: "Email không được để trống",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                  className="flex-1 p-2 outline-none"
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="mb-6 relative">
              <label className="block text-gray-700 font-medium mb-2">
                Mật khẩu
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="px-3 py-2 bg-gray-100">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  {...register("password", {
                    required: "Mật khẩu không được để trống",
                  })}
                  type="password"
                  className="flex-1 p-2 outline-none"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-gray-600">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="#" className="text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
