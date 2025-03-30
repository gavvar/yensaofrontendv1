import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_ENDPOINTS } from "../services/api/endpoints";
// import { useAuth } from "@/contexts/authContext"; // Import tại thành phần có khả năng sử dụng

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng: Đảm bảo cookies được gửi
});

// Biến để theo dõi nếu đang refresh token
let isRefreshing = false;
// Hàng đợi các requests đang đợi token mới
let refreshQueue: Array<(token: string | Error) => void> = [];

// Sửa định nghĩa hàm processQueue để chấp nhận unknown
const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach((callback) => {
    if (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    } else if (token) {
      callback(token);
    }
  });

  // Reset hàng đợi
  refreshQueue = [];
};

// Thêm interceptor để xử lý lỗi 401 và tự động refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Không cố refresh nếu đang ở endpoint refresh
      originalRequest.url !== API_ENDPOINTS.AUTH.REFRESH
    ) {
      if (isRefreshing) {
        // Nếu đang refresh, đưa request vào hàng đợi
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (typeof token === "string") {
              // Thử lại request ban đầu với token mới
              resolve(apiClient(originalRequest));
            } else {
              // Lỗi khi refresh, từ chối promise
              reject(token);
            }
          });
        });
      }

      // Đánh dấu đang refresh và thử refresh token
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        const refreshResponse = await apiClient.post(
          API_ENDPOINTS.AUTH.REFRESH
        );

        // Xử lý refresh thành công
        if (refreshResponse.data.success) {
          console.log("Token refreshed successfully");

          // Thông báo với queue là đã có token mới
          processQueue(null, "refreshed");

          // Thử lại request ban đầu
          return apiClient(originalRequest);
        } else {
          processQueue(new Error("Refresh token failed"));
          // Thông báo session hết hạn
          window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Xử lý lỗi TypeScript
        if (refreshError instanceof Error) {
          processQueue(refreshError);
        } else {
          processQueue(new Error("Unknown refresh token error"));
        }

        // Xử lý khi refresh thất bại
        window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Interceptor cho request để log thông tin (debug)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (typeof document !== "undefined") {
      console.log(
        "Cookies being sent:",
        document.cookie ? document.cookie.split(";") : []
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response ${response.status}: ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `API Error ${error.response?.status} for ${error.config?.url}:`,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// Thêm biến để theo dõi trạng thái chuyển hướng
let isRedirecting = false;

// Interceptor để xử lý 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Kiểm tra nếu lỗi là 401 Unauthorized và không đang chuyển hướng
    if (error.response && error.response.status === 401 && !isRedirecting) {
      // Nếu đang ở client-side và không phải trang login
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        isRedirecting = true; // Đặt cờ chuyển hướng

        // Xóa thông tin người dùng từ localStorage
        localStorage.removeItem("user");

        // Chuyển hướng đến trang đăng nhập
        window.location.href = "/login?session=expired";

        // Reset cờ sau khi đã chuyển hướng
        setTimeout(() => {
          isRedirecting = false;
        }, 5000);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
