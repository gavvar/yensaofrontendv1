"use client";

import React from "react";
import { formatCurrency } from "@/utils/format";
// Sử dụng Image từ next/image
import Image from "next/image";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string;
  orderInfo: {
    orderId: number;
    orderNumber: string;
    amount: number;
  };
  onPaymentComplete: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  paymentUrl,
  orderInfo,
  onPaymentComplete,
}) => {
  // Xoá router vì không sử dụng

  if (!isOpen) return null;

  // Mở thanh toán MoMo trong tab mới
  const openMomoPayment = () => {
    window.open(paymentUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Thanh toán MoMo
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">
            Vui lòng nhấn nút bên dưới để mở cổng thanh toán MoMo
          </p>
          <p className="font-semibold text-amber-600 text-lg">
            {formatCurrency(orderInfo.amount)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Mã đơn hàng: {orderInfo.orderNumber}
          </p>
        </div>

        <div className="flex justify-center my-6">
          <button
            onClick={openMomoPayment}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            {/* Thay thẻ img bằng Image từ next/image */}
            <div className="mr-2">
              <Image
                src="/images/payment/momo-icon.png"
                alt="MoMo"
                width={24}
                height={24}
                className="w-6 h-6"
                onError={(e) => {
                  // Fallback cho Image
                  const fallbackSrc = "/images/payment/momo.png";
                  if (e.currentTarget.src !== fallbackSrc) {
                    e.currentTarget.src = fallbackSrc;
                  }
                }}
              />
            </div>
            Mở ứng dụng MoMo
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mb-4">
          <p>Sau khi thanh toán xong, hãy quay lại đây và nhấn Đã thanh toán</p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onPaymentComplete}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Đã thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
