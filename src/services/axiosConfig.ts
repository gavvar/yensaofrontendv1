// src/services/axiosConfig.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshToken } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// Interface mở rộng cho AxiosRequestConfig
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng để gửi/nhận cookies
});

// Helper function để lấy token từ sessionStorage trước, không có thì lấy từ localStorage
const getToken = (): string | null => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

// Biến để theo dõi refresh token đang xử lý
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

// Xử lý hàng đợi failed requests
const processQueue = (
  error: Error | null,
  token: string | null = null
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Thêm interceptor để đính kèm token vào mỗi request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi 401 (Unauthorized) và 403 (Forbidden)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Kiểm tra xem error có phải là AxiosError không
    if (!(error instanceof AxiosError)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Xử lý lỗi 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error("Bạn không có quyền truy cập tài nguyên này!");
      // Có thể thêm toast thông báo hoặc redirect nếu cần
    }

    // Nếu là lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (typeof token === "string" && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        const response = await refreshToken();

        if (response.data.success) {
          const { token } = response.data.data;

          // Lưu token mới vào cùng vị trí (sessionStorage hoặc localStorage)
          if (sessionStorage.getItem("token")) {
            sessionStorage.setItem("token", token);
          } else {
            localStorage.setItem("token", token);
          }

          // Cập nhật token cho request hiện tại
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          // Xử lý hàng đợi requests
          processQueue(null, token);

          return apiClient(originalRequest);
        } else {
          throw new Error("Refresh token failed");
        }
      } catch (refreshError) {
        const error =
          refreshError instanceof Error
            ? refreshError
            : new Error("Refresh token failed");
        processQueue(error, null);

        // Xóa dữ liệu đăng nhập nếu refresh token thất bại
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect về trang login
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
