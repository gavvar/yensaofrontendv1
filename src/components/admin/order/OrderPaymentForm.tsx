import React, { useState } from "react";
import { PaymentStatus } from "@/types/order";
import { PAYMENT_STATUSES, PAYMENT_METHODS } from "@/constants/order";
import { formatAmount } from "@/utils/format";
import {
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

interface OrderPaymentFormProps {
  orderId: number;
  orderTotal: number;
  currentPaymentStatus: PaymentStatus;
  currentPaymentMethod: string;
  paymentId?: string;
  paidAmount?: number;
  paidAt?: string;
  currency?: string;
  onUpdate: (paymentData: {
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    paymentId?: string;
    paidAmount?: number;
    paidAt?: string;
  }) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

/**
 * Form cập nhật thông tin thanh toán đơn hàng
 */
const OrderPaymentForm: React.FC<OrderPaymentFormProps> = ({
  orderTotal,
  currentPaymentStatus,
  currentPaymentMethod,
  paymentId = "",
  paidAmount,
  paidAt = "",
  currency = "VND",
  onUpdate,
  onCancel,
  className = "",
}) => {
  // Form state
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(currentPaymentStatus);
  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod);
  const [transactionId, setTransactionId] = useState(paymentId);
  const [amount, setAmount] = useState(
    paidAmount !== undefined ? paidAmount : orderTotal
  );
  const [paymentDate, setPaymentDate] = useState(
    paidAt
      ? new Date(paidAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine if form should allow editing payment details
  const canEditPaymentDetails = ["pending", "failed"].includes(paymentStatus);
  const canEditPaymentDate = ["paid", "refunded"].includes(paymentStatus);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Build payment data
      const paymentData = {
        paymentStatus,
        paymentMethod: paymentStatus === "pending" ? paymentMethod : undefined,
        paymentId: ["paid", "refunded"].includes(paymentStatus)
          ? transactionId
          : undefined,
        paidAmount: ["paid", "refunded"].includes(paymentStatus)
          ? amount
          : undefined,
        paidAt: ["paid", "refunded"].includes(paymentStatus)
          ? paymentDate
          : undefined,
      };

      // Call the update function
      await onUpdate(paymentData);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi cập nhật thông tin thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get available payment statuses based on current status
  const getAvailableStatuses = () => {
    switch (currentPaymentStatus) {
      case "pending":
        return PAYMENT_STATUSES.filter((s) =>
          ["pending", "paid", "failed"].includes(s.value)
        );
      case "paid":
        return PAYMENT_STATUSES.filter((s) =>
          ["paid", "refunded"].includes(s.value)
        );
      case "failed":
        return PAYMENT_STATUSES.filter((s) =>
          ["failed", "pending", "paid"].includes(s.value)
        );
      case "refunded":
        return PAYMENT_STATUSES.filter((s) => ["refunded"].includes(s.value));
      default:
        return PAYMENT_STATUSES;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
            <FiDollarSign className="mr-2" />
            Cập nhật thông tin thanh toán
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div>
          <label
            htmlFor="paymentStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Trạng thái thanh toán
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          >
            {getAvailableStatuses().map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method - only when status is pending or unpaid */}
        {canEditPaymentDetails && (
          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phương thức thanh toán
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Transaction ID - only when status is paid or refunded */}
        {["paid", "refunded"].includes(paymentStatus) && (
          <div>
            <label
              htmlFor="transactionId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mã giao dịch
            </label>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiCreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="Mã giao dịch thanh toán"
                />
              </div>
            </div>
          </div>
        )}

        {/* Amount - only when status is paid or refunded */}
        {["paid", "refunded"].includes(paymentStatus) && (
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Số tiền {paymentStatus === "refunded" ? "hoàn trả" : "thanh toán"}
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">₫</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                placeholder="0"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">{currency}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Tổng đơn hàng: {formatAmount(orderTotal, currency)}
            </p>
          </div>
        )}

        {/* Payment Date - only when status is paid or refunded */}
        {canEditPaymentDate && (
          <div>
            <label
              htmlFor="paymentDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày {paymentStatus === "refunded" ? "hoàn tiền" : "thanh toán"}
            </label>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ghi chú (tùy chọn)
          </label>
          <textarea
            id="note"
            name="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            placeholder="Thêm ghi chú về việc cập nhật thanh toán"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FiX className="mr-2 -ml-1 h-4 w-4" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            {loading ? (
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
            ) : (
              <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
            )}
            {loading ? "Đang cập nhật..." : "Cập nhật thanh toán"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OrderPaymentForm;
