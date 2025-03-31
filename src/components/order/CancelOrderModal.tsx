import React, { useState } from "react";
import Modal from "@/components/common/Modal";
import { FiAlertTriangle } from "react-icons/fi";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
  orderNumber: string;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderNumber,
}) => {
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    // Validate reason
    if (!cancelReason.trim()) {
      setError("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    // Clear error and submit
    setError("");
    await onConfirm(cancelReason);
  };

  // Common cancel reasons
  const commonReasons = [
    "Tôi muốn thay đổi phương thức thanh toán",
    "Tôi muốn thay đổi địa chỉ giao hàng",
    "Tôi muốn thay đổi sản phẩm/số lượng",
    "Thời gian giao hàng quá lâu",
    "Tôi đã đặt nhầm đơn hàng",
    "Tôi đổi ý, không muốn mua nữa",
  ];

  const handleSelectReason = (reason: string) => {
    setCancelReason(reason);
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận hủy đơn hàng"
      size="medium"
    >
      <div className="p-4">
        <div className="flex items-center mb-4 text-red-600">
          <FiAlertTriangle className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium">
            Bạn chắc chắn muốn hủy đơn hàng?
          </h3>
        </div>

        <p className="mb-4 text-gray-900">
          Bạn đang hủy đơn hàng{" "}
          <span className="font-medium">{orderNumber}</span>. Hành động này
          không thể hoàn tác sau khi xác nhận.
        </p>

        <div className="mb-4">
          <label
            htmlFor="cancelReason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lý do hủy đơn hàng <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancelReason"
            name="cancelReason"
            rows={3}
            className="shadow-sm block w-full focus:ring-amber-500 focus:border-amber-500 sm:text-sm border border-gray-300 rounded-md"
            placeholder="Vui lòng nhập lý do hủy đơn hàng"
            value={cancelReason}
            onChange={(e) => {
              setCancelReason(e.target.value);
              setError("");
            }}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-900 mb-2">
            Lựa chọn nhanh lý do phổ biến:
          </p>
          <div className="flex flex-wrap gap-2">
            {commonReasons.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => handleSelectReason(reason)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
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
                Đang xử lý...
              </>
            ) : (
              "Xác nhận hủy đơn hàng"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
