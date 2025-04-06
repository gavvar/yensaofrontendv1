import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_ENDPOINTS } from "../services/api/endpoints";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Đảm bảo cookies được gửi
});

// Biến để theo dõi nếu đang refresh token
let isRefreshing = false;
let refreshQueue: Array<(token: string | Error) => void> = [];
let isRedirecting = false;

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach((callback) => {
    if (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    } else if (token) {
      callback(token);
    }
  });
  refreshQueue = [];
};

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

// THAY THẾ tất cả các interceptor 401 cũ bằng một interceptor duy nhất
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Kiểm tra lỗi 401 và chưa thử refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== API_ENDPOINTS.AUTH.REFRESH &&
      !isRedirecting
    ) {
      // Nếu đang refresh, đưa request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (typeof token === "string") {
              resolve(apiClient(originalRequest));
            } else {
              reject(token);
            }
          });
        });
      }

      // Đánh dấu đang refresh và thử refresh token
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Đảm bảo gửi cookies khi refresh token
        const refreshResponse = await apiClient.post(
          API_ENDPOINTS.AUTH.REFRESH,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          console.log("Token refreshed successfully");
          processQueue(null, "refreshed");
          return apiClient(originalRequest);
        } else {
          processQueue(new Error("Refresh token failed"));
          handleAuthFailure();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        processQueue(
          refreshError instanceof Error
            ? refreshError
            : new Error("Unknown refresh token error")
        );
        handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Cập nhật hàm handleAuthFailure để sử dụng locale trong URL
function handleAuthFailure() {
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.includes("/login")
  ) {
    isRedirecting = true;

    // Xóa user từ localStorage
    localStorage.removeItem("user");

    // Tìm locale trong URL hiện tại
    const pathParts = window.location.pathname.split("/");
    const localeMatch = pathParts.length > 1 ? pathParts[1] : "vi";
    const locale = ["vi", "en"].includes(localeMatch) ? localeMatch : "vi";

    // Chuyển hướng đến trang đăng nhập với locale
    window.location.href = `/${locale}/login?session=expired`;

    // Reset flag sau khi chuyển hướng
    setTimeout(() => {
      isRedirecting = false;
    }, 5000);
  }
}

export default apiClient;
