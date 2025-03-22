// src/services/authService.ts
import apiClient from "./axiosConfig";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
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

export const register = async (data: RegisterData) => {
  return apiClient.post<AuthResponse>("/auth/register", data);
};

export const login = async (data: LoginData) => {
  return apiClient.post<AuthResponse>("/auth/login", data);
};

export const forgotPassword = async (data: ForgotPasswordData) => {
  return apiClient.post<{ success: boolean; message: string }>(
    "/auth/forgot-password",
    data
  );
};

export const resetPassword = async (data: ResetPasswordData) => {
  return apiClient.post<{ success: boolean; message: string }>(
    "/auth/reset-password",
    data
  );
};

export const changePassword = async (data: ChangePasswordData) => {
  return apiClient.post<{ success: boolean; message: string }>(
    "/auth/change-password",
    data
  );
};

export const logout = async () => {
  return apiClient.post<{ success: boolean; message: string }>("/auth/logout");
};

export const logoutAll = async () => {
  return apiClient.post<{ success: boolean; message: string }>(
    "/auth/logout-all"
  );
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

export const refreshToken = async () => {
  return apiClient.post<{ success: boolean; data: { token: string } }>(
    "/auth/refresh-token"
  );
};

export const getMe = async () => {
  return apiClient.get<{
    success: boolean;
    data: {
      id: string;
      role: string;
      email: string;
    };
  }>("/auth/me");
};
