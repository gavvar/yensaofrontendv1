"use client";

import React, { useState, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import CouponForm from "@/components/admin/coupons/CouponForm";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Coupon, CouponInput } from "@/types/coupon";
import couponService from "@/services/couponService";
import Link from "next/link";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = Number(params.id);

  // State
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lấy thông tin coupon khi component mount
  useEffect(() => {
    const fetchCouponDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await couponService.getCouponById(couponId);
        setCoupon(result.data);
      } catch (err) {
        console.error("Error fetching coupon:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin mã giảm giá"
        );
      } finally {
        setLoading(false);
      }
    };

    if (couponId) {
      fetchCouponDetails();
    }
  }, [couponId]);

  // Xử lý cập nhật coupon
  const handleUpdateCoupon = async (data: CouponInput) => {
    setSubmitting(true);

    try {
      await couponService.updateCoupon(couponId, data);
      toast.success("Cập nhật mã giảm giá thành công");
      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật mã giảm giá"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Format coupon data để truyền vào form
  const formatCouponForForm = (coupon: Coupon): CouponInput => {
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
      userLimit: coupon.userLimit,
      active: coupon.active,
      description: coupon.description,
      userId: coupon.userId,
      appliedProducts: coupon.appliedProducts,
      appliedCategories: coupon.appliedCategories,
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <AdminPageHeader
        title="Chỉnh sửa mã giảm giá"
        description="Cập nhật thông tin mã giảm giá"
      />

      <div className="mb-6">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" />
          Quay lại danh sách
        </Link>
      </div>

      {loading ? (
        <Loading message="Đang tải thông tin mã giảm giá..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : coupon ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CouponForm
            initialData={formatCouponForForm(coupon)}
            onSubmit={handleUpdateCoupon}
            isSubmitting={submitting}
            isEditing={true}
          />
        </div>
      ) : (
        <ErrorMessage message="Không tìm thấy thông tin mã giảm giá" />
      )}
    </div>
  );
}
