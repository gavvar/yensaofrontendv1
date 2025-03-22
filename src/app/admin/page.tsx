"use client";

import { useState } from "react";
import {
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiCalendar,
  FiMoreVertical,
  FiSearch,
  FiFilter,
  FiEye,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [period, setPeriod] = useState("7ngay");

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-gray-600">Chào mừng trở lại, Admin!</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="today">Hôm nay</option>
              <option value="7ngay">7 ngày qua</option>
              <option value="30ngay">30 ngày qua</option>
              <option value="90ngay">Quý này</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <FiCalendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-50">
            <FiFilter className="h-5 w-5 text-gray-600" />
          </button>

          <button className="bg-amber-600 text-white rounded-md px-4 py-2 hover:bg-amber-700 transition-colors flex items-center">
            <FiSearch className="mr-2" /> Tìm kiếm
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Thẻ thống kê Doanh Thu */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                <span className="text-gray-400">Đang tải...</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <FiDollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Thẻ thống kê Đơn Hàng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Đơn hàng mới</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                <span className="text-gray-400">Đang tải...</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Thẻ thống kê Khách Hàng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Khách hàng mới</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                <span className="text-gray-400">Đang tải...</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <FiUsers className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Thẻ thống kê Sản Phẩm */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Sản phẩm tồn kho</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                <span className="text-gray-400">Đang tải...</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiPackage className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Biểu đồ doanh thu
              </h2>
              <p className="text-sm text-gray-500">Doanh thu theo thời gian</p>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <FiMoreVertical />
            </button>
          </div>

          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              Dữ liệu biểu đồ sẽ được hiển thị từ API
            </p>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Đơn hàng</h2>
              <p className="text-sm text-gray-500">
                Số lượng đơn hàng theo thời gian
              </p>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <FiMoreVertical />
            </button>
          </div>

          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              Dữ liệu biểu đồ sẽ được hiển thị từ API
            </p>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Đơn hàng gần đây
              </h2>
              <button className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center">
                Xem tất cả <FiEye className="ml-1" />
              </button>
            </div>
          </div>

          <div className="p-6 text-center text-gray-500">
            Dữ liệu đơn hàng sẽ được hiển thị từ API
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Hoạt động gần đây
            </h2>
          </div>

          <div className="p-6 text-center text-gray-500">
            Hoạt động gần đây sẽ được hiển thị từ API
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Sản phẩm bán chạy
            </h2>
            <button className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center">
              Xem tất cả <FiEye className="ml-1" />
            </button>
          </div>
        </div>

        <div className="p-6 text-center text-gray-500">
          Dữ liệu sản phẩm bán chạy sẽ được hiển thị từ API
        </div>
      </div>
    </>
  );
}
