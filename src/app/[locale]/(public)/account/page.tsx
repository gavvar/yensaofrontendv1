"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { toast } from "react-toastify";
import { FiEdit, FiSave, FiX } from "react-icons/fi";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const profileResponse = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
      if (profileResponse.data?.success) {
        const profileData = profileResponse.data.data;
        setUpdatedProfile({
          fullName: profileData.fullName || user?.fullName || "",
          email: profileData.email || user?.email || "",
          phone: profileData.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    setUpdatedProfile({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: "",
    });

    fetchUserData();
  }, [user, router, fetchUserData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USER.PROFILE,
        updatedProfile
      );

      if (response.data.success) {
        toast.success("Cập nhật thông tin thành công");
        setEditingProfile(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Tài khoản của tôi
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Thông tin cá nhân
            </h2>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-amber-600 hover:text-amber-700 flex items-center text-sm"
            >
              {editingProfile ? (
                <>
                  <FiX className="mr-1" /> Hủy chỉnh sửa
                </>
              ) : (
                <>
                  <FiEdit className="mr-1" /> Chỉnh sửa
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-amber-500 rounded-full"></div>
            </div>
          ) : editingProfile ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={updatedProfile.fullName}
                    onChange={(e) =>
                      setUpdatedProfile({
                        ...updatedProfile,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={updatedProfile.email}
                    onChange={(e) =>
                      setUpdatedProfile({
                        ...updatedProfile,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Email không thể thay đổi
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={updatedProfile.phone}
                    onChange={(e) =>
                      setUpdatedProfile({
                        ...updatedProfile,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" /> Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-sm text-gray-700 mb-1">Họ và tên</p>
                  <p className="font-medium">{updatedProfile.fullName}</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-sm text-gray-700 mb-1">Email</p>
                  <p className="font-medium">{updatedProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1">Số điện thoại</p>
                  <p className="font-medium">
                    {updatedProfile.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
