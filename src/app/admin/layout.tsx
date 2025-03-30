"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import Link from "next/link";
// import Image from "next/image";
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiBarChart2,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronDown,
  FiList,
} from "react-icons/fi";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Protect admin route
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/login");
      } else if (user.role !== "admin") {
        console.log("User is not admin, redirecting to home");
        router.push("/");
      }
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // If not admin, don't render anything
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-amber-600 text-white">
          <span className="text-xl font-semibold">Admin Panel</span>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-4">
          <Link
            href="/admin"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiHome size={20} className="mr-3" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiShoppingBag size={20} className="mr-3" />
            <span>Đơn hàng</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiList size={20} className="mr-3" />
            <span>Danh mục</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiPackage size={20} className="mr-3" />
            <span>Sản phẩm</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiUsers size={20} className="mr-3" />
            <span>Người dùng</span>
          </Link>
          <Link
            href="/admin/statistics"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiBarChart2 size={20} className="mr-3" />
            <span>Thống kê</span>
          </Link>
          <Link
            href="/admin/revenue"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiDollarSign size={20} className="mr-3" />
            <span>Doanh thu</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg mb-2"
          >
            <FiSettings size={20} className="mr-3" />
            <span>Cài đặt</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm h-16 flex items-center sticky top-0 z-10">
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-amber-600 hover:bg-amber-50 focus:outline-none"
            >
              {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Page Title */}
            <h1 className="text-xl font-semibold text-gray-800">
              Admin Dashboard
            </h1>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center p-2 rounded-full text-gray-700 hover:bg-amber-50 hover:text-amber-600 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white font-bold mr-2">
                  {user.email ? user.email.charAt(0).toUpperCase() : "A"}
                </div>
                <span className="hidden md:block font-medium">
                  {user.email}
                </span>
                <FiChevronDown
                  className={`ml-2 transition-transform duration-300 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-amber-600">Quản trị viên</p>
                  </div>
                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Hồ sơ
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Cài đặt
                  </Link>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Về trang người dùng
                  </Link>
                  <div className="border-t my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
