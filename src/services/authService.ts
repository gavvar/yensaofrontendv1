// src/services/authService.ts
import apiClient from "./axiosConfig";

export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}) => {
  return apiClient.post("/auth/register", data);
};

export const loginUser = async (data: { email: string; password: string }) => {
  return apiClient.post("/auth/login", data);
};
