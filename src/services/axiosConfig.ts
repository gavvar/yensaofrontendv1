// src/services/axiosConfig.ts
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

console.log("API BASE URL:", baseURL);

const apiClient = axios.create({
  baseURL,
  timeout: 10000, // Thời gian timeout cho mỗi request (10 giây)
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request: tự động thêm Authorization nếu token tồn tại
apiClient.interceptors.request.use(
  (config) => {
    // Kiểm tra nếu window đã tồn tại để đảm bảo đây là code client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response: có thể xử lý lỗi chung ở đây nếu cần
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
