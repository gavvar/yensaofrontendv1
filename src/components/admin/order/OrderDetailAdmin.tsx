import React, { useState } from "react";
import { Order, OrderItem, OrderNote } from "@/types/order";
import {
  formatAmount,
  formatDateTime,
  formatPaymentMethod,
} from "@/utils/format";
import OrderStatusForm from "./OrderStatusForm";
import OrderTimeline from "@/components/order/OrderTimeline";
import OrderTrackingInfo from "@/components/order/OrderTrackingInfo";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/OrderStatusBadge";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFileText,
  FiEdit2,
  FiPrinter,
  FiDownload,
  FiMessageSquare,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import Link from "next/link";

interface OrderDetailAdminProps {
  order: Order;
  notes: OrderNote[];
  onStatusUpdate: (orderStatus: string) => Promise<void>;
  onPaymentStatusUpdate: (paymentStatus: string) => Promise<void>;
  onAddNote: (note: string, isPrivate: boolean) => Promise<void>;
  onDeleteNote?: (noteId: number) => Promise<void>;
  onPrintOrder?: () => void;
  onDownloadInvoice?: () => void;
  onDeleteOrder?: () => void;
  onRestoreOrder?: () => void;
  className?: string;
}

/**
 * Component chi tiết đơn hàng dành cho Admin
 */
const OrderDetailAdmin: React.FC<OrderDetailAdminProps> = ({
  order,
  notes,
  onStatusUpdate,
  onPaymentStatusUpdate,
  onAddNote,
  onDeleteNote,
  onPrintOrder,
  onDownloadInvoice,
  onDeleteOrder,
  onRestoreOrder,
  className = "",
}) => {
  const [newNote, setNewNote] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [openStatusForm, setOpenStatusForm] = useState(false);
  const [openPaymentStatusForm, setOpenPaymentStatusForm] = useState(false);

  // Xử lý thêm ghi chú mới
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      await onAddNote(newNote, isPrivateNote);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  // Xử lý xóa ghi chú
  const handleDeleteNote = async (noteId: number) => {
    if (!onDeleteNote) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      try {
        await onDeleteNote(noteId);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  // Xử lý khi admin cập nhật trạng thái
  const handleStatusUpdate = async (status: string) => {
    try {
      await onStatusUpdate(status);
      setOpenStatusForm(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Xử lý khi admin cập nhật trạng thái thanh toán
  const handlePaymentStatusUpdate = async (status: string) => {
    try {
      await onPaymentStatusUpdate(status);
      setOpenPaymentStatusForm(false);
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  return (
    <div
      className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <FiPackage className="text-gray-500" />
              <h2 className="text-lg font-bold text-gray-800">
                Đơn hàng #{order.orderNumber}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Ngày đặt: {formatDateTime(order.orderDate, "long")}
            </p>
            {order.deleted && (
              <div className="mt-1 text-sm text-red-600 font-medium">
                Đơn hàng đã bị xóa
              </div>
            )}
          </div>

          <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {onPrintOrder && (
                <button
                  onClick={onPrintOrder}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiPrinter className="mr-1.5 -ml-0.5 h-4 w-4" />
                  In
                </button>
              )}

              {onDownloadInvoice && (
                <button
                  onClick={onDownloadInvoice}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDownload className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Xuất PDF
                </button>
              )}

              <Link
                href={`/admin/orders/edit/${order.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEdit2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                Sửa
              </Link>

              {!order.deleted && onDeleteOrder && (
                <button
                  onClick={onDeleteOrder}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <FiTrash2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Xóa
                </button>
              )}

              {order.deleted && onRestoreOrder && (
                <button
                  onClick={onRestoreOrder}
                  className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                >
                  <FiRefreshCw className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Khôi phục
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order status badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div
            className="flex items-center"
            onClick={() => setOpenStatusForm(!openStatusForm)}
          >
            <OrderStatusBadge status={order.orderStatus} />
            <button className="ml-1 text-gray-400 hover:text-amber-600">
              <FiEdit2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            className="flex items-center"
            onClick={() => setOpenPaymentStatusForm(!openPaymentStatusForm)}
          >
            <PaymentStatusBadge status={order.paymentStatus} />
            <button className="ml-1 text-gray-400 hover:text-amber-600">
              <FiEdit2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status update forms */}
      {openStatusForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <OrderStatusForm
            currentStatus={order.orderStatus}
            onUpdate={handleStatusUpdate}
            onCancel={() => setOpenStatusForm(false)}
            type="order"
          />
        </div>
      )}

      {openPaymentStatusForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <OrderStatusForm
            currentStatus={order.paymentStatus}
            onUpdate={handlePaymentStatusUpdate}
            onCancel={() => setOpenPaymentStatusForm(false)}
            type="payment"
          />
        </div>
      )}

      {/* Timeline */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <OrderTimeline order={order} />
      </div>

      {/* Tracking info if shipping */}
      {order.orderStatus === "shipped" && order.trackingNumber && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <OrderTrackingInfo
            trackingNumber={order.trackingNumber}
            shippingProvider={order.shippingProvider}
            estimatedDeliveryDate={order.estimatedDeliveryDate}
          />
        </div>
      )}

      {/* Order info sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Customer info */}
        <div className="p-4 sm:p-6 border-b md:border-r border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Thông tin khách hàng
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <FiUser className="mt-0.5 mr-2 text-gray-500" />
              <div>
                <p className="font-medium text-gray-800">
                  {order.customerName}
                </p>
                {order.customerId && (
                  <Link
                    href={`/admin/customers/${order.customerId}`}
                    className="text-xs text-amber-600 hover:text-amber-800"
                  >
                    Xem thông tin khách hàng
                  </Link>
                )}
              </div>
            </div>

            {order.customerEmail && (
              <div className="flex items-center">
                <FiMail className="mr-2 text-gray-500" />
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-gray-800 hover:text-amber-600"
                >
                  {order.customerEmail}
                </a>
              </div>
            )}

            <div className="flex items-center">
              <FiPhone className="mr-2 text-gray-500" />
              <a
                href={`tel:${order.customerPhone}`}
                className="text-gray-800 hover:text-amber-600"
              >
                {order.customerPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Shipping info */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Địa chỉ giao hàng
          </h3>
          <div className="flex items-start">
            <FiMapPin className="mt-0.5 mr-2 text-gray-500" />
            <div>
              <p className="text-gray-800">{order.customerAddress}</p>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="p-4 sm:p-6 border-b md:border-r border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Thông tin thanh toán
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-28 text-sm text-gray-500">Phương thức:</div>
              <div className="text-gray-800 font-medium">
                {formatPaymentMethod(order.paymentMethod)}
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 text-sm text-gray-500">Trạng thái:</div>
              <div>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            {order.paymentId && (
              <div className="flex items-start">
                <div className="w-28 text-sm text-gray-500">Mã giao dịch:</div>
                <div className="text-gray-800">{order.paymentId}</div>
              </div>
            )}

            {order.paidAt && (
              <div className="flex items-start">
                <div className="w-28 text-sm text-gray-500">Thời gian:</div>
                <div className="text-gray-800">
                  {formatDateTime(order.paidAt, "long")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order notes */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
            <FiMessageSquare className="mr-2" />
            Ghi chú đơn hàng
          </h3>

          {/* Notes list */}
          {notes && notes.length > 0 ? (
            <div className="space-y-3 mb-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-md ${
                    note.isPrivate ? "bg-yellow-50" : "bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          note.isPrivate
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {note.isPrivate ? "Nội bộ" : "Hiển thị cho khách"}
                      </span>
                    </div>
                    {onDeleteNote && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{note.content}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    {note.authorName && <span>{note.authorName} - </span>}
                    {formatDateTime(note.createdAt, "long")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">
              Chưa có ghi chú cho đơn hàng này
            </p>
          )}

          {/* Add note form */}
          <form onSubmit={handleAddNote}>
            <div className="mb-3">
              <label htmlFor="noteContent" className="sr-only">
                Thêm ghi chú
              </label>
              <textarea
                id="noteContent"
                name="noteContent"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Thêm ghi chú về đơn hàng..."
                className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="privateNote"
                  name="privateNote"
                  type="checkbox"
                  checked={isPrivateNote}
                  onChange={() => setIsPrivateNote(!isPrivateNote)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="privateNote"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Ghi chú nội bộ (khách hàng không nhìn thấy)
                </label>
              </div>
              <button
                type="submit"
                disabled={!newNote.trim() || addingNote}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {addingNote ? "Đang lưu..." : "Thêm ghi chú"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Sản phẩm</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sản phẩm
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Đơn giá
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Số lượng
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item: OrderItem) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center">
                      {item.product?.image && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.product.image}
                            alt={item.productName}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.productName}
                        </div>
                        {item.variantName && (
                          <div className="text-xs text-gray-500">
                            Phân loại: {item.variantName}
                          </div>
                        )}
                        {item.sku && (
                          <div className="text-xs text-gray-500">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-500">
                    {formatAmount(item.price, order.currency)}
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-900 font-medium">
                    {formatAmount(item.price * item.quantity, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              {/* Subtotal */}
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-sm text-right text-gray-500"
                >
                  Tạm tính:
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-900 font-medium">
                  {formatAmount(order.subtotal || 0, order.currency)}
                </td>
              </tr>

              {/* Shipping */}
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-sm text-right text-gray-500"
                >
                  Phí vận chuyển:
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-900 font-medium">
                  {formatAmount(order.shippingFee, order.currency)}
                </td>
              </tr>

              {/* Discount if applicable */}
              {order.discount > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm text-right text-gray-500"
                  >
                    Giảm giá {order.couponCode && `(${order.couponCode})`}:
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                    -{formatAmount(order.discount, order.currency)}
                  </td>
                </tr>
              )}

              {/* Tax if applicable */}
              {order.tax > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm text-right text-gray-500"
                  >
                    Thuế:
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-900 font-medium">
                    {formatAmount(order.tax, order.currency)}
                  </td>
                </tr>
              )}

              {/* Total */}
              <tr className="border-t border-gray-200">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-base text-right text-gray-800 font-bold"
                >
                  Tổng cộng:
                </td>
                <td className="px-4 py-3 text-base text-right text-gray-900 font-bold">
                  {formatAmount(order.totalAmount, order.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Order note */}
      {order.note && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start">
            <FiFileText className="mt-1 mr-2 text-gray-500" />
            <div>
              <p className="font-medium text-gray-800">Ghi chú từ khách hàng</p>
              <p className="mt-1 text-sm text-gray-600">{order.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailAdmin;
