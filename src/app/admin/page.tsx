"use client";

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
import { useStats } from "@/hooks/useStats";
import { formatCurrency, formatNumber } from "@/utils/format";
import StatsCard from "@/components/admin/analytics/StatsCard";
import RevenueChart from "@/components/admin/analytics/RevenueChart";
import TopProductsTable from "@/components/admin/analytics/TopProductsTable";

import Link from "next/link";

export default function AdminDashboard() {
  const {
    dashboardStats,
    revenueData,
    topProducts,
    loading,
    period,
    setPeriod,
    groupBy,
    setGroupBy,
  } = useStats();

  // Ánh xạ giá trị period từ dropdown sang giá trị cho API
  const handlePeriodChange = (selectedPeriod: string) => {
    switch (selectedPeriod) {
      case "today":
        setPeriod("week");
        break;
      case "7ngay":
        setPeriod("week");
        break;
      case "30ngay":
        setPeriod("month");
        break;
      case "90ngay":
        setPeriod("quarter");
        break;
      default:
        setPeriod("week");
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100800">
            Tổng quan
          </h1>
          <p className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
            Chào mừng trở lại, Admin!
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <select
              value={
                period === "week"
                  ? "7ngay"
                  : period === "month"
                  ? "30ngay"
                  : period === "quarter"
                  ? "90ngay"
                  : "7ngay"
              }
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="today">Hôm nay</option>
              <option value="7ngay">7 ngày qua</option>
              <option value="30ngay">30 ngày qua</option>
              <option value="90ngay">Quý này</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <FiCalendar className="h-4 w-4 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
            </div>
          </div>

          <button className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-50">
            <FiFilter className="h-5 w-5 text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100" />
          </button>

          <button className="bg-amber-600 text-white rounded-md px-4 py-2 hover:bg-amber-700 transition-colors flex items-center">
            <FiSearch className="mr-2" /> Tìm kiếm
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Thẻ thống kê Doanh Thu */}
        <StatsCard
          title="Tổng doanh thu"
          value={
            loading.dashboard
              ? "Đang tải..."
              : formatCurrency(dashboardStats?.revenue || 0)
          }
          icon={<FiDollarSign className="h-6 w-6" />}
          loading={loading.dashboard}
          color="bg-emerald-100 text-emerald-600"
        />

        {/* Thẻ thống kê Đơn Hàng */}
        <StatsCard
          title="Đơn hàng mới"
          value={
            loading.dashboard
              ? "Đang tải..."
              : formatNumber(dashboardStats?.totalOrders || 0)
          }
          icon={<FiShoppingBag className="h-6 w-6" />}
          loading={loading.dashboard}
          color="bg-blue-100 text-blue-600"
        />

        {/* Thẻ thống kê Khách Hàng */}
        <StatsCard
          title="Khách hàng mới"
          value={
            loading.dashboard
              ? "Đang tải..."
              : formatNumber(dashboardStats?.newCustomers || 0)
          }
          icon={<FiUsers className="h-6 w-6" />}
          loading={loading.dashboard}
          color="bg-amber-100 text-amber-600"
        />

        {/* Thẻ thống kê Sản Phẩm */}
        <StatsCard
          title="Sản phẩm tồn kho"
          value={
            loading.dashboard
              ? "Đang tải..."
              : formatNumber(dashboardStats?.productsSold || 0)
          }
          icon={<FiPackage className="h-6 w-6" />}
          loading={loading.dashboard}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <RevenueChart
          data={revenueData || []} // Thêm fallback nếu revenueData là null hoặc undefined
          loading={loading.revenue}
          groupBy={groupBy}
          onGroupByChange={(value) => setGroupBy(value)} // Đảm bảo đúng kiểu dữ liệu
        />

        {/* Orders Status Chart */}
        {/* Bạn có thể thêm OrderStatusChart ở đây */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100800">
                Đơn hàng
              </h2>
              <p className="text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                Phân bố theo trạng thái
              </p>
            </div>
            <button className="text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 hover:text-gray-900 dark:text-gray-100700">
              <FiMoreVertical />
            </button>
          </div>

          {loading.orderStatus ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {dashboardStats?.ordersByStatus && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-blue-700">Chờ xử lý</span>
                    <p className="text-2xl font-bold text-blue-700 mt-2">
                      {dashboardStats.ordersByStatus.pending}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-amber-700">Đang xử lý</span>
                    <p className="text-2xl font-bold text-amber-700 mt-2">
                      {dashboardStats.ordersByStatus.processing}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-indigo-700">Đang giao</span>
                    <p className="text-2xl font-bold text-indigo-700 mt-2">
                      {dashboardStats.ordersByStatus.shipped}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <span className="text-sm text-green-700">Đã giao</span>
                    <p className="text-2xl font-bold text-green-700 mt-2">
                      {dashboardStats.ordersByStatus.delivered}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100800">
                Đơn hàng gần đây
              </h2>
              <Link
                href="/admin/orders"
                className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center"
              >
                Xem tất cả <FiEye className="ml-1" />
              </Link>
            </div>
          </div>

          {loading.dashboard ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : dashboardStats?.totalOrders && dashboardStats.totalOrders > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Placeholder rows */}
                  {[1, 2, 3].map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                        #ORD-{Math.floor(Math.random() * 10000)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                        Khách hàng {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100 text-right">
                        {formatCurrency(
                          Math.floor(Math.random() * 1000000) + 500000
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đã thanh toán
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
              Chưa có đơn hàng nào trong thời gian này
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100800">
              Hoạt động gần đây
            </h2>
          </div>

          {loading.dashboard ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {[
                "Khách hàng mới đăng ký",
                "Đơn hàng mới được tạo",
                "Đánh giá sản phẩm mới",
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    {index === 0 ? (
                      <FiUsers className="h-4 w-4" />
                    ) : index === 1 ? (
                      <FiShoppingBag className="h-4 w-4" />
                    ) : (
                      <FiPackage className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100700">
                      {activity}
                    </p>
                    <p className="text-xs text-gray-900 dark:text-gray-100900 dark:text-gray-900 dark:text-gray-100100">
                      {index === 0
                        ? "2 giờ trước"
                        : index === 1
                        ? "4 giờ trước"
                        : "6 giờ trước"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <TopProductsTable
        products={topProducts || []}
        loading={loading.topProducts}
      />
    </>
  );
}
