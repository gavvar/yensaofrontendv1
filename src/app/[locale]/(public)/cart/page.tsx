"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/format";
import { getProductImageUrl } from "@/utils/product";
import {
  FiMinusCircle,
  FiPlusCircle,
  FiTrash2,
  FiShoppingBag,
  FiEdit,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/contexts/authContext";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    toggleSelectItem,
    updateNotes,
    selectAll,
    selectedItemsCount,
    selectedItemsTotal,
  } = useCart();

  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [allSelected, setAllSelected] = useState(false);

  // Kiểm tra nếu tất cả sản phẩm được chọn
  useEffect(() => {
    if (cart?.items.length) {
      const allItemsSelected = cart.items.every(
        (item) => item.selectedForCheckout
      );
      setAllSelected(allItemsSelected);
    }
  }, [cart]);

  // Thêm vào đầu component CartPage
  useEffect(() => {
    if (cart?.items?.length) {
      console.log("Cart items:", cart.items);
      cart.items.forEach((item, index) => {
        console.log(`Item ${index} - ${item.product.name}:`);
        console.log("Product images:", JSON.stringify(item.product.images));
      });
    }
  }, [cart]);

  // Xử lý chọn tất cả
  const handleSelectAll = async () => {
    const newSelectAll = !allSelected;
    setAllSelected(newSelectAll);
    await selectAll(newSelectAll);
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  // Xử lý ghi chú
  const startEditingNotes = (
    itemId: number,
    currentNotes: string | null = ""
  ) => {
    setEditingNotes(itemId);
    setNoteText(currentNotes || "");
  };

  const saveNotes = async (itemId: number) => {
    await updateNotes(itemId, noteText);
    setEditingNotes(null);
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setNoteText("");
  };

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/cart");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="mb-6">Bạn cần đăng nhập để xem giỏ hàng</p>
          <Link
            href="/login?redirect=/cart"
            className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <FiShoppingBag size={40} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm
            của chúng tôi.
          </p>
          <Link
            href="/products"
            className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-6 font-medium">Sản phẩm</div>
              <div className="col-span-2 font-medium text-center">Số lượng</div>
              <div className="col-span-2 font-medium text-right">
                Thành tiền
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Cart Items */}
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center p-4 border-b"
              >
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={item.selectedForCheckout}
                    onChange={() =>
                      toggleSelectItem(item.id, !item.selectedForCheckout)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </div>

                {/* Product Info */}
                <div className="col-span-6">
                  <div className="flex items-start">
                    {/* Image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={getProductImageUrl(item.product)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback khi ảnh lỗi
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/product-placeholder.png";
                        }}
                      />
                    </Link>

                    {/* Name and Notes */}
                    <div className="ml-3">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-medium hover:text-amber-600"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm mt-1">
                        <div className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                          Đơn giá:{" "}
                          {formatCurrency(
                            item.product.discountPrice || item.product.price
                          )}
                        </div>

                        {/* Notes Section */}
                        {editingNotes === item.id ? (
                          <div className="mt-2 flex items-center">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Thêm ghi chú..."
                              className="border rounded p-1 text-sm w-full"
                            />
                            <button
                              onClick={() => saveNotes(item.id)}
                              className="ml-1 text-green-600"
                              title="Lưu"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={cancelEditingNotes}
                              className="ml-1 text-red-600"
                              title="Hủy"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                            {item.notes ? (
                              <>
                                <span className="line-clamp-1">
                                  {item.notes}
                                </span>
                                <button
                                  onClick={() =>
                                    startEditingNotes(item.id, item.notes || "")
                                  }
                                  className="ml-1 text-amber-600"
                                  title="Chỉnh sửa ghi chú"
                                >
                                  <FiEdit size={12} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditingNotes(item.id)}
                                className="text-amber-600 text-xs flex items-center"
                              >
                                <FiEdit size={12} className="mr-1" /> Thêm ghi
                                chú
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-2">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-amber-600"
                    >
                      <FiMinusCircle size={18} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                      className="w-10 mx-2 border rounded py-1 px-2 text-center"
                      min="1"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-amber-600"
                    >
                      <FiPlusCircle size={18} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="col-span-2 text-right font-medium">
                  {formatCurrency(item.subtotal)}
                </div>

                {/* Delete Button */}
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-red-500"
                    title="Xóa sản phẩm"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 pb-4 border-b">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Số lượng sản phẩm đã chọn:
                </span>
                <span className="font-medium">{selectedItemsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Tổng tiền:
                </span>
                <span className="font-medium">
                  {formatCurrency(selectedItemsTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                  Phí vận chuyển:
                </span>
                <span className="font-medium">Miễn phí</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg mb-6 pt-3 border-t">
              <span>Thành tiền:</span>
              <span className="text-amber-600">
                {formatCurrency(selectedItemsTotal)}
              </span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              disabled={selectedItemsCount === 0}
              className={`w-full py-3 rounded-md font-medium text-white ${
                selectedItemsCount > 0
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Tiến hành thanh toán
            </button>

            <div className="mt-4">
              <Link
                href="/products"
                className="text-amber-600 hover:text-amber-700 text-center block"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
