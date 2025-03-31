import React from "react";
import Image from "next/image";
import { formatCurrency, formatNumber } from "@/utils/format";
import { FiEye } from "react-icons/fi";
import Link from "next/link";
import { TopProductItem } from "@/hooks/useStats"; // Import từ useStats

// Thêm thuộc tính mở rộng có ý nghĩa
export interface TopProduct extends TopProductItem {
  displayRank?: number; // Thứ hạng hiển thị
  percentageOfTotal?: number; // Phần trăm của tổng doanh thu
  status?: "trending" | "stable" | "declining"; // Trạng thái xu hướng
}

interface TopProductsTableProps {
  products: TopProduct[] | TopProductItem[]; // Chấp nhận cả hai kiểu
  loading: boolean;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Sản phẩm bán chạy
          </h2>
        </div>
        <div className="p-6 flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Sản phẩm bán chạy
          </h2>
          <Link
            href="/admin/products"
            className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center"
          >
            Xem tất cả <FiEye className="ml-1" />
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="p-6 text-center text-gray-900">
          Chưa có dữ liệu sản phẩm bán chạy
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Đã bán
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {product.image ||
                        (product.product && product.product.image) ? (
                          <Image
                            src={
                              product.image ||
                              (product.product && product.product.image) ||
                              "/placeholders/product.png"
                            }
                            alt={product.name || product.productName}
                            fill
                            className="rounded-md object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-900">
                            ?
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name ||
                            product.productName ||
                            (product.product && product.product.name)}
                        </div>
                        <div className="text-sm text-gray-900">
                          {/* Display any additional product info here */}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(
                      product.price ||
                        (product.product && product.product.price) ||
                        0
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(product.quantity || product.totalSold || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(
                      product.revenue || product.totalRevenue || 0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;
