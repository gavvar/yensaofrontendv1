import React, { useState } from "react";
import { formatDateTime } from "@/utils/format";
import {
  FiTruck,
  FiExternalLink,
  FiPackage,
  FiCalendar,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

interface OrderTrackingInfoProps {
  trackingNumber: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
  className?: string;
}

/**
 * Component hiển thị thông tin vận chuyển của đơn hàng
 */
const OrderTrackingInfo: React.FC<OrderTrackingInfoProps> = ({
  trackingNumber,
  shippingProvider,
  estimatedDeliveryDate,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  // Xử lý copy tracking number
  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // URL theo dõi đơn hàng dựa trên nhà vận chuyển
  const getTrackingUrl = () => {
    if (!shippingProvider) return "";

    switch (shippingProvider.toLowerCase()) {
      case "ghn":
      case "giaohanghanh":
      case "giao hang nhanh":
        return `https://donhang.ghn.vn/?order_code=${trackingNumber}`;
      case "ghtk":
      case "giaohangtietkiem":
      case "giao hang tiet kiem":
        return `https://i.ghtk.vn/${trackingNumber}`;
      case "viettelpost":
      case "viettel post":
        return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/?bill=${trackingNumber}`;
      case "jandt":
      case "j&t":
      case "j&t express":
        return `https://jtexpress.vn/track?billcodes=${trackingNumber}`;
      default:
        return "";
    }
  };

  const trackingUrl = getTrackingUrl();

  return (
    <div className={`${className}`}>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100800 mb-3 flex items-center">
        <FiTruck className="mr-2" />
        Thông tin vận chuyển
      </h3>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-3">
            {/* Tracking number */}
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                Mã vận đơn:
              </p>
              <div className="mt-1 flex items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100800">
                  {trackingNumber}
                </span>
                <button
                  className="ml-2 text-blue-600 hover:text-blue-800 p-1"
                  onClick={handleCopyTracking}
                  title="Sao chép mã vận đơn"
                >
                  {copied ? (
                    <FiCheck className="h-4 w-4" />
                  ) : (
                    <FiCopy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Shipping provider */}
            {shippingProvider && (
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Đơn vị vận chuyển:
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-gray-100800 flex items-center">
                  <FiPackage className="mr-2" />
                  {shippingProvider}
                </p>
              </div>
            )}

            {/* Estimated delivery date */}
            {estimatedDeliveryDate && (
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Dự kiến giao hàng:
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-gray-100800 flex items-center">
                  <FiCalendar className="mr-2" />
                  {formatDateTime(estimatedDeliveryDate, "short")}
                </p>
              </div>
            )}
          </div>

          {/* Track button */}
          {trackingUrl && (
            <div className="self-end">
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Theo dõi đơn hàng
                <FiExternalLink className="ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingInfo;
