// src/services/userService.ts
import apiClient from "../utils/axiosConfig";
import { User } from "./authService";

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface UserStats {
  total: number;
  active: number;
  admins: number;
  newThisMonth: number;
}

export const getProfile = async () => {
  return apiClient.get<{ success: boolean; data: User }>("/users/profile");
};

export const updateProfile = async (data: UpdateProfileData) => {
  return apiClient.put<{ success: boolean; data: User; message: string }>(
    "/users/profile",
    data
  );
};

// Cập nhật để phù hợp với API đặc tả
export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}) => {
  return apiClient.get<{
    success: boolean;
    data: {
      users: User[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    };
  }>("/users", { params });
};

export const getUserStats = async () => {
  return apiClient.get<{ success: boolean; data: UserStats }>("/users/stats");
};

// Cập nhật type role để khớp với API
export const updateUser = async (
  id: string,
  data: {
    fullName?: string;
    isActive?: boolean;
    role?: "customer" | "admin";
    password?: string;
  }
) => {
  return apiClient.put<{ success: boolean; data: User; message: string }>(
    `/users/${id}`,
    data
  );
};

export const deleteUser = async (id: string) => {
  return apiClient.delete<{ success: boolean; message: string }>(
    `/users/${id}`
  );
};

// Thêm hàm tạo user mới nếu cần
export const createUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  isActive?: boolean;
}) => {
  return apiClient.post<{ success: boolean; data: User; message: string }>(
    "/users",
    userData
  );
};
