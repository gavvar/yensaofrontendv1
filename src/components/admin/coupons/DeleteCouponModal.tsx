import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { Coupon } from "@/types/coupon";

interface DeleteCouponModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteCouponModal: React.FC<DeleteCouponModalProps> = ({
  coupon,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiAlertTriangle className="text-red-500 mr-2" />
            Xác nhận xóa
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-900 hover:text-gray-900 focus:outline-none"
            disabled={isDeleting}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Bạn có chắc chắn muốn xóa mã giảm giá sau không?
            </p>
            <div className="bg-gray-50 rounded-md p-3 mt-2 border border-gray-200">
              <p className="font-medium text-gray-900">{coupon.code}</p>
              {coupon.description && (
                <p className="text-sm text-gray-900 mt-1">
                  {coupon.description}
                </p>
              )}
            </div>
          </div>

          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <p>
              <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Dữ
              liệu liên quan đến mã giảm giá này có thể bị ảnh hưởng.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isDeleting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCouponModal;
