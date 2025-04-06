"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiSave, FiX } from "react-icons/fi";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import CouponForm from "@/components/admin/coupons/CouponForm";
import Link from "next/link";
import couponService from "@/services/couponService";
import { CouponInput } from "@/types/coupon";

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (couponData: CouponInput) => {
    setLoading(true);
    try {
      // Gọi API để tạo mã giảm giá
      await couponService.createCoupon(couponData);
      toast.success("Tạo mã giảm giá thành công!");
      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error creating coupon:", error);
      let errorMessage = "Đã xảy ra lỗi khi tạo mã giảm giá";

      // Type guard để kiểm tra error có thuộc tính response không
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <AdminPageHeader
        title="Tạo mã giảm giá mới"
        description="Tạo mã khuyến mãi mới cho khách hàng"
      />

      <div className="mb-6 flex justify-between">
        <Link
          href="/admin/coupons"
          className="flex items-center text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100"
        >
          <FiX className="mr-2" />
          Quay lại
        </Link>
        <button
          type="submit"
          form="coupon-form"
          disabled={loading}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <FiSave className="mr-2" />
          )}
          Lưu mã giảm giá
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CouponForm onSubmit={handleSubmit} isSubmitting={loading} />
      </div>
    </div>
  );
}
