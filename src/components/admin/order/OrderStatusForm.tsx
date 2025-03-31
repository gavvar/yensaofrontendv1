import React, { useState } from "react";
import { OrderStatus, PaymentStatus } from "@/types/order";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/constants/order";
import { FiAlertCircle, FiCheck, FiX, FiArrowRight } from "react-icons/fi";

interface OrderStatusFormProps {
  currentStatus: OrderStatus | PaymentStatus;
  onUpdate: (status: string) => Promise<void>;
  onCancel: () => void;
  type: "order" | "payment";
  showNote?: boolean;
  className?: string;
}

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

/**
 * Form cập nhật trạng thái đơn hàng
 */
const OrderStatusForm: React.FC<OrderStatusFormProps> = ({
  currentStatus,
  onUpdate,
  onCancel,
  type,
  showNote = true,
  className = "",
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [note, setNote] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Lấy danh sách trạng thái phù hợp với loại (đơn hàng hoặc thanh toán)
  const statuses: StatusOption[] =
    type === "order"
      ? (ORDER_STATUSES as StatusOption[])
      : (PAYMENT_STATUSES as StatusOption[]);

  // Danh sách trạng thái có thể chuyển đổi tiếp theo
  const getValidNextStatuses = (): StatusOption[] => {
    if (type === "order") {
      switch (currentStatus) {
        case "pending":
          return statuses.filter((s) =>
            ["pending", "processing", "cancelled"].includes(s.value)
          );
        case "processing":
          return statuses.filter((s) =>
            ["processing", "shipped", "cancelled"].includes(s.value)
          );
        case "shipped":
          return statuses.filter((s) =>
            ["shipped", "delivered", "cancelled"].includes(s.value)
          );
        case "delivered":
          return statuses.filter((s) => ["delivered"].includes(s.value));
        case "cancelled":
          return statuses.filter((s) =>
            ["cancelled", "pending"].includes(s.value)
          );
        default:
          return statuses;
      }
    } else {
      // Payment status transitions
      switch (currentStatus) {
        case "pending":
          return statuses.filter((s) =>
            ["pending", "paid", "failed"].includes(s.value)
          );
        case "paid":
          return statuses.filter((s) => ["paid", "refunded"].includes(s.value));
        case "failed":
          return statuses.filter((s) =>
            ["failed", "pending", "paid"].includes(s.value)
          );
        case "refunded":
          return statuses.filter((s) => ["refunded"].includes(s.value));
        default:
          return statuses;
      }
    }
  };

  const nextStatuses = getValidNextStatuses();

  // Mô tả cho trạng thái đơn hàng
  const getStatusDescription = (status: string): string => {
    if (type === "order") {
      switch (status) {
        case "pending":
          return "Đơn hàng đang chờ xác nhận từ Admin";
        case "processing":
          return "Đơn hàng đã được xác nhận và đang được chuẩn bị";
        case "shipped":
          return "Đơn hàng đã được giao cho đơn vị vận chuyển";
        case "delivered":
          return "Đơn hàng đã được giao thành công cho khách hàng";
        case "cancelled":
          return "Đơn hàng đã bị hủy";
        default:
          return "";
      }
    } else {
      switch (status) {
        case "pending":
          return "Đơn hàng chưa được thanh toán";
        case "paid":
          return "Đơn hàng đã được thanh toán thành công";
        case "failed":
          return "Thanh toán đơn hàng không thành công";
        case "refunded":
          return "Đơn hàng đã được hoàn tiền";
        default:
          return "";
      }
    }
  };

  // Xử lý cập nhật trạng thái
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setUpdating(true);
      await onUpdate(selectedStatus);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
    } finally {
      setUpdating(false);
    }
  };

  // Cảnh báo khi chuyển trạng thái quan trọng
  const getWarningMessage = (): string | null => {
    if (selectedStatus === currentStatus) return null;

    if (type === "order") {
      if (
        selectedStatus === "cancelled" &&
        ["processing", "shipped"].includes(currentStatus as string)
      ) {
        return "Cảnh báo: Bạn đang hủy đơn hàng đã được xử lý. Điều này có thể ảnh hưởng đến kho hàng và thanh toán.";
      }
      if (selectedStatus === "delivered") {
        return 'Lưu ý: Khi đánh dấu đơn hàng là "Đã giao", hệ thống sẽ tự động cập nhật tồn kho.';
      }
    } else {
      if (selectedStatus === "refunded") {
        return 'Cảnh báo: Đánh dấu "Hoàn tiền" không tự động hoàn tiền. Bạn cần xử lý hoàn tiền thủ công trên cổng thanh toán.';
      }
      if (selectedStatus === "paid" && currentStatus === "pending") {
        return 'Lưu ý: Bạn đang đánh dấu đơn hàng là "Đã thanh toán". Đảm bảo rằng bạn đã nhận được thanh toán từ khách hàng.';
      }
    }

    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <h3 className="text-base font-medium text-gray-900">
        Cập nhật{" "}
        {type === "order" ? "trạng thái đơn hàng" : "trạng thái thanh toán"}
      </h3>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <FiAlertCircle className="inline-block mr-1" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái hiện tại
          </label>
          <div className="flex items-center">
            <div className="px-3 py-2 bg-gray-100 text-gray-800 text-sm rounded-md">
              {statuses.find((s) => s.value === currentStatus)?.label ||
                currentStatus}
            </div>
            {selectedStatus !== currentStatus && (
              <>
                <FiArrowRight className="mx-2 text-gray-900" />
                <div className="px-3 py-2 bg-amber-100 text-amber-800 text-sm rounded-md">
                  {statuses.find((s) => s.value === selectedStatus)?.label ||
                    selectedStatus}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Chọn trạng thái mới
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            disabled={updating}
          >
            {nextStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-900">
            {getStatusDescription(selectedStatus)}
          </p>
        </div>

        {showNote && (
          <div className="mb-4">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              placeholder="Thêm ghi chú về việc thay đổi trạng thái"
              disabled={updating}
            ></textarea>
          </div>
        )}

        {warningMessage && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700 flex items-start">
            <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
            <p>{warningMessage}</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            disabled={updating}
          >
            <FiX className="mr-2 -ml-1 h-4 w-4" />
            Hủy
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            disabled={updating || selectedStatus === currentStatus}
          >
            {updating ? (
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
                Đang cập nhật...
              </>
            ) : (
              <>
                <FiCheck className="mr-2 -ml-1 h-4 w-4" />
                Cập nhật trạng thái
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderStatusForm;
