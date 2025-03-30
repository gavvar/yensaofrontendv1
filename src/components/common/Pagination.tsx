import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Số trang hiển thị trước và sau trang hiện tại
  const siblingsCount = 1;

  // Tạo mảng các trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];

    // Luôn hiển thị trang đầu tiên
    pages.push(1);

    // Tính toán các trang gần trang hiện tại
    const startPage = Math.max(2, currentPage - siblingsCount);
    const endPage = Math.min(totalPages - 1, currentPage + siblingsCount);

    // Thêm dấu ... sau trang 1 nếu cần
    if (startPage > 2) {
      pages.push(-1); // -1 đại diện cho dấu ...
    }

    // Thêm các trang ở giữa
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm dấu ... trước trang cuối nếu cần
    if (endPage < totalPages - 1) {
      pages.push(-2); // -2 đại diện cho dấu ... thứ hai
    }

    // Luôn hiển thị trang cuối cùng nếu có nhiều hơn 1 trang
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const renderPageButton = (pageNumber: number, label?: React.ReactNode) => {
    const isCurrentPage = pageNumber === currentPage;

    return (
      <button
        key={pageNumber}
        onClick={() => onPageChange(pageNumber)}
        disabled={isCurrentPage}
        className={`flex items-center justify-center w-10 h-10 mx-1 rounded-md focus:outline-none
          ${
            isCurrentPage
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }
        `}
        aria-current={isCurrentPage ? "page" : undefined}
      >
        {label || pageNumber}
      </button>
    );
  };

  // Nút Previous
  const renderPrevButton = () => (
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage <= 1}
      className={`flex items-center justify-center w-10 h-10 mx-1 rounded-md focus:outline-none
        ${
          currentPage <= 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }
      `}
      aria-label="Previous page"
    >
      <FiChevronLeft size={20} />
    </button>
  );

  // Nút Next
  const renderNextButton = () => (
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
      className={`flex items-center justify-center w-10 h-10 mx-1 rounded-md focus:outline-none
        ${
          currentPage >= totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }
      `}
      aria-label="Next page"
    >
      <FiChevronRight size={20} />
    </button>
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-6">
      <nav className="flex items-center" aria-label="Pagination">
        {renderPrevButton()}

        <div className="flex">
          {getPageNumbers().map((pageNumber) => {
            if (pageNumber === -1 || pageNumber === -2) {
              return (
                <span
                  key={`ellipsis-${pageNumber}`}
                  className="flex items-center justify-center w-10 h-10 mx-1 text-gray-500"
                >
                  ...
                </span>
              );
            }
            return renderPageButton(pageNumber);
          })}
        </div>

        {renderNextButton()}
      </nav>
    </div>
  );
};

export default Pagination;
