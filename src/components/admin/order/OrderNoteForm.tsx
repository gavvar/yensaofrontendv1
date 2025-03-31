import React, { useState } from "react";
import {
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiX,
  FiInfo,
} from "react-icons/fi";

interface OrderNoteFormProps {
  orderId: number;
  onSubmit: (noteData: {
    content: string;
    isPrivate: boolean;
    notify?: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
  allowNotification?: boolean;
  isLoading?: boolean;
  initialContent?: string;
  initialIsPrivate?: boolean;
  title?: string;
  submitLabel?: string;
  className?: string;
}

/**
 * Form thêm ghi chú cho đơn hàng
 */
const OrderNoteForm: React.FC<OrderNoteFormProps> = ({
  onSubmit,
  onCancel,
  allowNotification = false,
  isLoading = false,
  initialContent = "",
  initialIsPrivate = true,
  title = "Thêm ghi chú",
  submitLabel = "Thêm ghi chú",
  className = "",
}) => {
  // Form state
  const [content, setContent] = useState(initialContent);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      setError("");

      // Create note data
      const noteData = {
        content: content.trim(),
        isPrivate,
        notify: allowNotification && !isPrivate ? notifyCustomer : undefined,
      };

      // Call the submit function
      await onSubmit(noteData);

      // Reset form if not cancelled by parent component
      if (!onCancel) {
        setContent("");
        setNotifyCustomer(false);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi thêm ghi chú"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="space-y-4">
        {title && (
          <h3 className="text-base font-medium text-gray-900 flex items-center">
            <FiMessageSquare className="mr-2" />
            {title}
          </h3>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Note content */}
        <div>
          <label htmlFor="noteContent" className="sr-only">
            Nội dung ghi chú
          </label>
          <textarea
            id="noteContent"
            name="noteContent"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung ghi chú..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            disabled={isLoading}
            required
          ></textarea>
        </div>

        {/* Note type */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isPrivate"
              name="isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isPrivate" className="font-medium text-gray-700">
              Ghi chú nội bộ
            </label>
            <p className="text-gray-900">
              Ghi chú này chỉ hiển thị cho nhân viên, khách hàng không nhìn thấy
            </p>
          </div>
        </div>

        {/* Notification option - only for public notes */}
        {allowNotification && !isPrivate && (
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="notifyCustomer"
                name="notifyCustomer"
                type="checkbox"
                checked={notifyCustomer}
                onChange={() => setNotifyCustomer(!notifyCustomer)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="notifyCustomer"
                className="font-medium text-gray-700"
              >
                Gửi thông báo cho khách hàng
              </label>
              <p className="text-gray-900">
                Khách hàng sẽ nhận được email thông báo về ghi chú này
              </p>
            </div>
          </div>
        )}

        {/* Public note info */}
        {!isPrivate && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex">
            <FiInfo className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              Ghi chú công khai sẽ hiển thị cho khách hàng khi họ xem đơn hàng.
              Vui lòng đảm bảo nội dung phù hợp.
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FiX className="mr-2 -ml-1 h-4 w-4" />
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {isLoading ? (
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
            ) : isPrivate ? (
              <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
            ) : (
              <FiSend className="mr-2 -ml-1 h-4 w-4" />
            )}
            {isLoading ? "Đang xử lý..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OrderNoteForm;
