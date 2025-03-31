// src/services/authService.ts
import apiClient from "../utils/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    token: string;
  };
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Register
export const register = (data: RegisterData) => {
  return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
};

// Login
export const login = (data: LoginData) => {
  return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
};

// Forgot password - Thêm xử lý response chi tiết hơn
export const forgotPassword = (data: ForgotPasswordData) => {
  return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
};

// Reset password - Thêm xử lý response chi tiết hơn
export const resetPassword = (data: ResetPasswordData) => {
  return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
};

// Change password (when logged in)
export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
};

// Logout
export const logout = () => {
  return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
};

// Logout from all devices
export const logoutAll = () => {
  return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT_ALL);
};

export const getSessions = async () => {
  return apiClient.get<{
    success: boolean;
    data: {
      devices: {
        deviceId: string;
        lastLogin: string;
        userAgent: string;
      }[];
    };
  }>("/auth/sessions");
};

// Get logged-in user data
export const getMe = () => {
  return apiClient.get(API_ENDPOINTS.AUTH.ME);
};

// Refresh token
export const refreshToken = () => {
  return apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
};
