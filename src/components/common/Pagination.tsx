import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number; // Thêm prop totalItems (để hiển thị tổng số mục)
  onPageChange: (page: number) => void;
  showSummary?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  showSummary = true,
}) => {
  // Không hiển thị phân trang nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return showSummary && totalItems ? (
      <div className="text-sm text-gray-900 mt-4">
        <span>{totalItems} kết quả</span>
      </div>
    ) : null;
  }

  // Tạo danh sách các trang sẽ hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số lượng trang tối đa để hiển thị

    // Nếu tổng số trang ít, hiển thị tất cả
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Xác định phạm vi trang để hiển thị
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      // Điều chỉnh nếu endPage vượt quá totalPages
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      // Thêm trang đầu tiên và dấu ... nếu cần
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push("...");
        }
      }

      // Thêm các trang trong phạm vi
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Thêm dấu ... và trang cuối cùng nếu cần
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push("...");
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between mt-4">
      {/* Hiển thị tổng số kết quả nếu có */}
      {showSummary && totalItems && (
        <div className="text-sm text-gray-900">
          <span>{totalItems} kết quả</span>
        </div>
      )}

      <div className="flex items-center space-x-1 ml-auto">
        {/* Nút quay lại */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-2 border rounded-md ${
            currentPage === 1
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-900 hover:bg-gray-50"
          }`}
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>

        {/* Các nút số trang */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-gray-900">...</span>
            ) : (
              <button
                onClick={() => typeof page === "number" && onPageChange(page)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === page
                    ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                    : "border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Nút tiếp theo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-2 border rounded-md ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-gray-300 text-gray-900 hover:bg-gray-50"
          }`}
          aria-label="Next page"
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
