import React from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiDownload } from "react-icons/fi";

interface ExportReportFormProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onExport: () => void;
  dashboardStats: {
    totalOrders?: number;
    revenue?: number;
  } | null;
}

const ExportReportForm: React.FC<ExportReportFormProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onExport,
  dashboardStats,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">
          Xuất báo cáo doanh thu
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Chọn khoảng thời gian để xuất báo cáo doanh thu chi tiết
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm text-gray-700 w-20">Từ ngày:</label>
                <DatePicker
                  selected={startDate}
                  onChange={onStartDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                  dateFormat="dd/MM/yyyy"
                  maxDate={endDate}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm text-gray-700 w-20">Đến ngày:</label>
                <DatePicker
                  selected={endDate}
                  onChange={onEndDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                  dateFormat="dd/MM/yyyy"
                  minDate={startDate}
                  maxDate={new Date()}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm text-gray-700 w-20">Định dạng:</label>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full">
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>
            </div>

            <button
              onClick={onExport}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto"
            >
              <FiDownload className="mr-2" /> Xuất báo cáo
            </button>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-800 mb-3">
              Thông tin tổng quan báo cáo
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Khoảng thời gian:</span>
                <span className="text-sm font-medium">
                  {format(startDate, "dd/MM/yyyy")} -{" "}
                  {format(endDate, "dd/MM/yyyy")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng số đơn hàng:</span>
                <span className="text-sm font-medium">
                  {dashboardStats?.totalOrders || "..."}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng doanh thu:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(dashboardStats?.revenue || 0)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Đơn giá trung bình:
                </span>
                <span className="text-sm font-medium">
                  {dashboardStats?.totalOrders
                    ? formatCurrency(
                        (dashboardStats.revenue || 0) /
                          dashboardStats.totalOrders
                      )
                    : "..."}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              * Báo cáo sẽ bao gồm chi tiết về đơn hàng, sản phẩm, doanh thu
              theo ngày và thông tin thanh toán.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReportForm;
