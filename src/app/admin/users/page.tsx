"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import axios from "axios";
import {
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiUserPlus,
  FiUserCheck,
  FiUsers,
  FiUserX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// Định nghĩa interface cho đối tượng User
interface User {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "customer";
  isActive: boolean;
  createdAt: string;
  avatar?: string | null;
}

// Định nghĩa interface cho phản hồi API
interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interface cho đối tượng nhỏ chỉ chứa thông tin cần thiết khi xóa
interface UserToDelete {
  id: string;
  name: string;
}

export default function AdminUsers() {
  const { isAuthorized, loading: authLoading } = useRequireAuth(
    "/login",
    "admin"
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserToDelete | null>(null);
  const [filterRole, setFilterRole] = useState("all");
  const [usersStats, setUsersStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    new: 0,
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      if (filterRole !== "all") {
        queryParams.append("role", filterRole);
      }

      // Log để debug
      console.log("Fetching users with params:", queryParams.toString());

      // Đảm bảo endpoint đúng
      const response = await apiClient.get(
        `${API_ENDPOINTS.USER.LIST}?${queryParams.toString()}`
      );

      console.log("Response:", response.data);

      const data = response.data as UsersResponse;

      if (data.success) {
        setUsers(data.data.users);
        setTotalUsers(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Hiển thị lỗi chi tiết để debug
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data);
        console.error("Status:", error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      // Log để debug
      console.log("Fetching user stats from:", API_ENDPOINTS.USER.STATS);

      const response = await apiClient.get(API_ENDPOINTS.USER.STATS);
      console.log("Stats response:", response.data);

      if (response.data.success) {
        setUsersStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Hiển thị lỗi chi tiết để debug
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data);
        console.error("Status:", error.response?.status);
      }

      // Đặt giá trị mặc định để tránh lỗi render
      setUsersStats({
        total: 0,
        active: 0,
        inactive: 0,
        new: 0,
      });
    }
  };

  // Xử lý khi component mount hoặc dependencies thay đổi
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
      fetchUserStats();
    }
  }, [currentPage, searchTerm, filterRole, isAuthorized]);

  // Create or update user
  const handleSaveUser = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      setLoading(true);

      if (selectedUser?.id) {
        // Update existing user
        await apiClient.put(
          API_ENDPOINTS.USER.DETAIL(selectedUser.id),
          Object.fromEntries(formData)
        );
      } else {
        // Create new user
        await apiClient.post(
          API_ENDPOINTS.USER.LIST,
          Object.fromEntries(formData)
        );
      }

      // Reload users after successful operation
      fetchUsers();
      fetchUserStats();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      await apiClient.delete(API_ENDPOINTS.USER.DETAIL(userToDelete.id));

      // Reload users after deletion
      fetchUsers();
      fetchUserStats();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở modal chỉnh sửa
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Xử lý mở modal xác nhận xoá
  const handleDeleteConfirm = (user: UserToDelete) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Xử lý đóng modal chỉnh sửa
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // If still checking auth or not authorized, show loading
  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Tiêu đề trang và công cụ tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>
          <p className="text-gray-900">
            Quản lý thông tin và quyền của người dùng
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
          </div>

          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 pointer-events-none" />
          </div>

          <button
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => {
              setSelectedUser(null); // Đảm bảo form trống
              setIsModalOpen(true);
            }}
          >
            <FiUserPlus className="mr-2" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Thống kê người dùng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tổng số người dùng */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  usersStats.total
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiUsers className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Người dùng mới */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Người dùng mới (30 ngày)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  usersStats.new
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiUserPlus className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Người dùng hoạt động */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Người dùng hoạt động</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  usersStats.active
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <FiUserCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Người dùng bị khoá */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-900 text-sm">Người dùng bị khoá</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? (
                  <span className="text-gray-900">Đang tải...</span>
                ) : (
                  usersStats.inactive
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FiUserX className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách người dùng
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.fullName}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-medium">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Customer"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Hoạt động" : "Bị khoá"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-amber-600 hover:text-amber-900"
                              onClick={() => handleEditUser(user)}
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() =>
                                handleDeleteConfirm({
                                  id: user.id,
                                  name: user.fullName,
                                })
                              }
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-center">
                      <td colSpan={6} className="px-6 py-10 text-gray-900">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {users.length > 0 ? (currentPage - 1) * 10 + 1 : 0}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, totalUsers)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{totalUsers}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FiChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === pageNum
                              ? "bg-amber-50 text-amber-600"
                              : "bg-white text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal chỉnh sửa người dùng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser?.id
                    ? "Chỉnh sửa người dùng"
                    : "Thêm người dùng"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-900 hover:text-gray-900"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveUser}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Họ tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      defaultValue={selectedUser?.fullName || ""}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={selectedUser?.email || ""}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Vai trò
                    </label>
                    <select
                      id="role"
                      name="role"
                      defaultValue={selectedUser?.role || "customer"}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Trạng thái
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={
                        selectedUser?.isActive ? "active" : "inactive"
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Bị khoá</option>
                    </select>
                  </div>

                  {!selectedUser?.id && (
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Mật khẩu
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required={!selectedUser?.id}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận xoá người dùng
                </h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-900 hover:text-gray-900"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-900">
                  Bạn có chắc chắn muốn xoá người dùng{" "}
                  <span className="font-medium">{userToDelete.name}</span>? Hành
                  động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
