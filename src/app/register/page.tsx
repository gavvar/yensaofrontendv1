"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";
import { registerUser } from "@/services/authService";
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin } from "react-icons/fi";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      toast.success("Đăng ký thành công!");
      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Đăng ký thất bại";
        toast.error(errorMessage);
      } else {
        toast.error("Đăng ký thất bại");
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
            Tạo tài khoản để mua sắm và theo dõi đơn hàng dễ dàng
          </p>
          <div className="w-32 h-32 rounded-full bg-white/10 mx-auto flex items-center justify-center">
            <FiUser className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Right column - Register form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Đăng ký tài khoản
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Họ và tên
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="px-3 py-2 bg-gray-100">
                  <FiUser className="text-gray-500" />
                </div>
                <input
                  {...register("fullName", {
                    required: "Họ và tên không được để trống",
                  })}
                  className="flex-1 p-2 outline-none"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.fullName.message}
                </span>
              )}
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
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
                    minLength: {
                      value: 6,
                      message: "Mật khẩu tối thiểu 6 ký tự",
                    },
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

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Số điện thoại
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="px-3 py-2 bg-gray-100">
                  <FiPhone className="text-gray-500" />
                </div>
                <input
                  {...register("phone", {
                    required: "Số điện thoại không được để trống",
                  })}
                  className="flex-1 p-2 outline-none"
                  placeholder="0123456789"
                />
              </div>
              {errors.phone && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Địa chỉ
              </label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="px-3 py-2 bg-gray-100">
                  <FiMapPin className="text-gray-500" />
                </div>
                <input
                  {...register("address", {
                    required: "Địa chỉ không được để trống",
                  })}
                  className="flex-1 p-2 outline-none"
                  placeholder="123 Đường ABC, Phường XYZ, TP.HCM"
                />
              </div>
              {errors.address && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.address.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
