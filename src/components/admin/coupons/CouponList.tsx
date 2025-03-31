import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Coupon } from "@/types/coupon";
import { formatCurrency } from "@/utils/format";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";

interface CouponListProps {
  coupons: Coupon[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDeleteCoupon: (id: number) => void;
}

const CouponList: React.FC<CouponListProps> = ({
  coupons,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  onDeleteCoupon,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return "Không hợp lệ";
    }
  };

  // Format coupon value
  const formatCouponValue = (coupon: Coupon) => {
    if (coupon.type === "percentage") {
      return `${coupon.value}%`;
    } else {
      return formatCurrency(coupon.value);
    }
  };

  // Format coupon max discount
  const formatMaxDiscount = (coupon: Coupon) => {
    if (coupon.type === "percentage" && coupon.maxDiscount) {
      return `Tối đa ${formatCurrency(coupon.maxDiscount)}`;
    }
    return null;
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
      onDeleteCoupon(id);
    }
  };

  if (coupons.length === 0) {
    return (
      <EmptyState
        title="Không có mã giảm giá nào"
        description="Chưa có mã giảm giá nào được tạo hoặc không có mã giảm giá nào phù hợp với điều kiện tìm kiếm."
        icon={<span className="text-3xl">🏷️</span>}
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Mã giảm giá
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Giá trị
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Đơn tối thiểu
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Thời gian
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Đã dùng
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {coupon.code}
                  </div>
                  {coupon.description && (
                    <div
                      className="text-xs text-gray-900 truncate max-w-xs"
                      title={coupon.description}
                    >
                      {coupon.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {formatCouponValue(coupon)}
                  </div>
                  {formatMaxDiscount(coupon) && (
                    <div className="text-xs text-gray-900">
                      {formatMaxDiscount(coupon)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.minOrderValue > 0 ? (
                      formatCurrency(coupon.minOrderValue)
                    ) : (
                      <span className="text-gray-900 text-xs">
                        Không giới hạn
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-900">
                    Từ: {formatDate(coupon.startDate)}
                  </div>
                  <div className="text-xs text-gray-900">
                    Đến: {formatDate(coupon.endDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.usageCount} / {coupon.usageLimit || "∞"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      coupon.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.active ? "Kích hoạt" : "Vô hiệu"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/coupons/edit/${coupon.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEdit2 className="h-5 w-5" title="Chỉnh sửa" />
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="h-5 w-5" title="Xóa" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
};

export default CouponList;
