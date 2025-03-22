"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  login as loginApi,
  register as registerApi,
  getMe,
  refreshToken as refreshApi,
} from "@/services/authService";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Định nghĩa đúng kiểu dữ liệu User
interface User {
  id: string;
  role: "user" | "admin";
  email: string;
  fullName?: string; // Thêm dấu ? để chỉ ra thuộc tính tùy chọn
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
  avatar?: string | null;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa kiểu dữ liệu cho phản hồi API
interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user?: {
      id: string;
      email: string;
      role: string;
      fullName?: string;
    };
    id?: string; // Trường hợp API trả về trực tiếp
    email?: string;
    role?: string;
    fullName?: string;
  };
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<User | null>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validateUserRole = (role: string): "user" | "admin" => {
  return role === "admin" ? "admin" : "user";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clear error helper - DI CHUYỂN HÀM NÀY LÊN TRƯỚC
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Token handling utilities
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("token") || localStorage.getItem("token");
  }, []);

  const saveToken = useCallback(
    (token: string, rememberMe: boolean = false) => {
      if (typeof window === "undefined") return;

      // Sử dụng cookie thay vì localStorage/sessionStorage
      if (rememberMe) {
        // Cookie sống 30 ngày
        document.cookie = `token=${token}; path=/; max-age=${
          30 * 24 * 60 * 60
        }`;
      } else {
        // Session cookie - mất khi đóng trình duyệt
        document.cookie = `token=${token}; path=/`;
      }

      // Vẫn lưu vào storage cho tương thích ngược
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
    },
    []
  );

  const removeToken = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } catch (err) {
      console.error("Lỗi khi xóa token:", err);
    }
  }, []);

  // Xử lý lỗi xác thực và chuyển hướng khi cần
  const handleAuthError = useCallback(() => {
    removeToken();
    setUser(null);

    // Chuyển hướng về trang login nếu không phải đang ở trang login
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      router.push("/login?session=expired");
    }
  }, [removeToken, router]);

  // Kiểm tra trạng thái xác thực
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getMe();
      const responseData = response.data as AuthResponse;

      if (responseData.success) {
        // Lưu thông tin user vào state
        const userData = responseData.data;

        const userObject: User = {
          id: userData.id || userData.user?.id || "",
          role: validateUserRole(
            userData.role || userData.user?.role || "user"
          ),
          email: userData.email || userData.user?.email || "",
          fullName: userData.fullName || userData.user?.fullName,
        };

        setUser(userObject);

        // Cập nhật thông tin user trong storage để đồng bộ
        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;
        storage.setItem("user", JSON.stringify(userObject));
      } else {
        throw new Error("Token không hợp lệ");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        try {
          const refreshResponse = await refreshApi();
          const refreshData = refreshResponse.data as AuthResponse;

          if (refreshData.success) {
            saveToken(
              refreshData.data.token,
              localStorage.getItem("token") !== null
            );
            // Thử lại getMe() sau khi refresh token
            await checkAuth();
            return;
          } else {
            handleAuthError();
          }
        } catch {
          handleAuthError();
        }
      } else {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, saveToken, handleAuthError]);

  // Khởi tạo xác thực khi app khởi động
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Kiểm tra token trong localStorage/sessionStorage
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Khôi phục user từ storage trước (để UI hiển thị nhanh)
      // Ưu tiên lấy từ cùng storage với token
      try {
        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;
        const storedUser = storage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser) as User;
          console.log("Khôi phục dữ liệu user từ storage:", userData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục user từ storage:", error);
      }

      // Sau đó kiểm tra với server để đảm bảo token vẫn hợp lệ
      await checkAuth();
    };

    initAuth();
  }, [getToken, checkAuth]);

  // Login function
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<User | null> => {
    try {
      setLoading(true);
      clearError(); // Bây giờ có thể sử dụng an toàn

      const response = await loginApi({ email, password });
      const responseData = response.data as AuthResponse;

      if (responseData.success) {
        // Trích xuất dữ liệu từ response
        const { token } = responseData.data;

        // Xử lý trường hợp API trả về user nested hoặc flat
        let userData = responseData.data.user;

        // Nếu không có userData.user, giả định API trả về dữ liệu phẳng
        if (!userData) {
          userData = {
            id: responseData.data.id || "",
            email: responseData.data.email || "",
            role: responseData.data.role || "user",
            fullName: responseData.data.fullName,
          };
        }

        // Tạo user object với vai trò được xác thực
        const validatedUser: User = {
          id: userData.id,
          email: userData.email,
          role: validateUserRole(userData.role),
          fullName: userData.fullName,
        };

        // Lưu token vào storage phù hợp
        saveToken(token, rememberMe);

        // Lưu thông tin user vào cùng storage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(validatedUser));

        console.log("Đã lưu dữ liệu user:", validatedUser);
        console.log(
          "Vị trí lưu trữ:",
          rememberMe ? "localStorage" : "sessionStorage"
        );

        // Cập nhật state
        setUser(validatedUser);

        // Thêm thời gian chờ nhỏ trước khi trả về kết quả
        // để đảm bảo state đã được cập nhật
        await new Promise((resolve) => setTimeout(resolve, 50));

        return validatedUser;
      } else {
        throw new Error(responseData.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      try {
        setLoading(true);
        clearError(); // Bây giờ có thể sử dụng an toàn

        const response = await registerApi({ fullName, email, password });
        const responseData = response.data as AuthResponse;

        if (responseData.success) {
          const { token } = responseData.data;

          // Xử lý trường hợp API trả về user nested hoặc flat
          const userData = responseData.data.user || {
            id: responseData.data.id || "",
            email: responseData.data.email || "",
            role: responseData.data.role || "user",
            fullName: responseData.data.fullName,
          };

          // Tạo user object với vai trò được xác thực
          const validatedUser: User = {
            id: userData.id,
            email: userData.email,
            role: validateUserRole(userData.role),
            fullName: userData.fullName,
          };

          // Lưu token mặc định vào sessionStorage
          saveToken(token, false);

          // Lưu thông tin user
          sessionStorage.setItem("user", JSON.stringify(validatedUser));

          // Cập nhật state
          setUser(validatedUser);
        } else {
          setError(responseData.message || "Đăng ký thất bại");
        }
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "Đăng ký thất bại");
        } else {
          setError("Đăng ký thất bại");
        }
      } finally {
        setLoading(false);
      }
    },
    [saveToken, clearError]
  );

  // Logout function
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    router.push("/login");
  }, [removeToken, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
