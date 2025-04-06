import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Coupon } from "@/types/coupon";
import { formatCurrency } from "@/utils/format";
import { FiTag, FiCalendar, FiPercent, FiUsers, FiInfo } from "react-icons/fi";

interface CouponCardProps {
  coupon: Coupon;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Không hợp lệ";
    }
  };

  // Format coupon value
  const formatCouponValue = () => {
    if (coupon.type === "percentage") {
      return `${coupon.value}%`;
    } else {
      return formatCurrency(coupon.value);
    }
  };

  // Format time remaining
  const getTimeStatus = () => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return {
        status: "upcoming",
        text: "Sắp có hiệu lực",
        color: "text-yellow-600 bg-yellow-100",
      };
    } else if (now > endDate) {
      return {
        status: "expired",
        text: "Đã hết hạn",
        color: "text-red-600 bg-red-100",
      };
    } else {
      return {
        status: "active",
        text: "Đang hiệu lực",
        color: "text-green-600 bg-green-100",
      };
    }
  };

  const timeStatus = getTimeStatus();

  // Usage status
  const getUsageStatus = () => {
    if (coupon.usageLimit === null) {
      return `${coupon.usageCount} lượt sử dụng`;
    }
    return `${coupon.usageCount} / ${coupon.usageLimit} lượt sử dụng`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <FiTag className="text-indigo-500 mr-2" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            {coupon.code}
          </h3>
        </div>
        <div
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            coupon.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {coupon.active ? "Kích hoạt" : "Vô hiệu"}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Description */}
        {coupon.description && (
          <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-4">
            {coupon.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discount Details */}
          <div className="space-y-2">
            <div className="flex items-start">
              <FiPercent className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mt-1 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Giảm giá:
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  {formatCouponValue()}
                  {coupon.type === "percentage" && coupon.maxDiscount && (
                    <span className="ml-1 text-sm font-normal text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                      (tối đa {formatCurrency(coupon.maxDiscount)})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FiInfo className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mt-1 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Đơn hàng tối thiểu:
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  {coupon.minOrderValue > 0 ? (
                    formatCurrency(coupon.minOrderValue)
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                      Không giới hạn
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Time Details */}
          <div className="space-y-2">
            <div className="flex items-start">
              <FiCalendar className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mt-1 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Thời gian:
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Từ:{" "}
                  <span className="font-medium">
                    {formatDate(coupon.startDate)}
                  </span>
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Đến:{" "}
                  <span className="font-medium">
                    {formatDate(coupon.endDate)}
                  </span>
                </p>
                <p
                  className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${timeStatus.color}`}
                >
                  {timeStatus.text}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FiUsers className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mt-1 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Sử dụng:
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  {getUsageStatus()}
                </p>
                {coupon.userLimit && (
                  <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                    Mỗi người dùng tối đa {coupon.userLimit} lần
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              Chỉnh sửa
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm text-red-600 font-medium bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponCard;
