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
  logout as logoutApi,
} from "@/services/authService";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Định nghĩa đúng kiểu dữ liệu User
interface User {
  id: string | number; // Hỗ trợ cả string và number cho ID
  role: "customer" | "admin"; // Thay đổi từ "user" thành "customer"
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

// Thêm isAuthenticated vào AuthContextType
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean; // Thêm trường này
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
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cập nhật hàm validateUserRole để xử lý undefined
const validateUserRole = (role?: string): "customer" | "admin" => {
  return role === "admin" ? "admin" : "customer";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setRedirectAttempt] = useState(0);
  const router = useRouter();

  // Clear error helper - DI CHUYỂN HÀM NÀY LÊN TRƯỚC
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Xử lý lỗi xác thực và chuyển hướng khi cần
  const handleAuthError = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");

    // Ngăn nhiều lần redirect trong thời gian ngắn
    setRedirectAttempt((prev) => {
      const now = Date.now();
      const lastAttempt = prev;

      // Chỉ redirect nếu cách lần cuối > 2 giây
      if (now - lastAttempt > 2000) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          router.push("/login?session=expired");
        }
        return now;
      }
      return prev;
    });
  }, [router]);

  // Cập nhật hàm checkAuth - thêm xử lý user data
  const checkAuth = useCallback(async () => {
    try {
      console.log("Checking authentication with /auth/me...");

      const response = await getMe();
      const responseData = response.data as AuthResponse;

      if (responseData.success) {
        console.log("Auth successful, processing user data");

        // Xử lý data từ API - hỗ trợ cả 2 format
        const userData = responseData.data.user || responseData.data;

        // Kiểm tra dữ liệu bắt buộc
        if (!userData || !userData.id || !userData.email) {
          console.error("Missing required user data from API", userData);
          return false;
        }

        // Tạo user object với role đã xác thực
        const validatedUser: User = {
          id: userData.id, // Đã check không null
          email: userData.email, // Đã check không null
          role: validateUserRole(userData.role),
          fullName: userData.fullName || "",
        };

        // Cập nhật localStorage và state
        localStorage.setItem("user", JSON.stringify(validatedUser));
        setUser(validatedUser);

        return true;
      } else {
        // Rest of your code for handling auth failure
      }
    } catch (err: unknown) {
      console.error("Error checking auth:", err);
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          // Xử lý lỗi 401 - Unauthorized
          handleAuthError();
        } else {
          console.error("Unexpected error:", err.response?.data);
        }
      }
      // Existing error handling code - already good
    }
  }, [handleAuthError]);

  // Khởi tạo xác thực khi app khởi động
  useEffect(() => {
    // Kiểm tra nếu đang ở đường dẫn login, không thực hiện kiểm tra auth
    if (
      typeof window !== "undefined" &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register")
    ) {
      return;
    }

    // Không tự động redirect khi ở các trang public
    const publicRoutes = ["/home", "/about", "/contact"]; // Define your public routes here
    const isPublicRoute = publicRoutes.some((route) =>
      window.location.pathname.startsWith(route)
    );

    const initAuth = async () => {
      setLoading(true);
      console.log("Initializing auth...");

      // 1. Khôi phục từ localStorage trước
      let userFromStorage = null;
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          userFromStorage = JSON.parse(storedUser) as User;
          userFromStorage.role = validateUserRole(userFromStorage.role);
          setUser(userFromStorage); // Đặt user ngay lập tức để UI hiển thị
          console.log("Restored user from localStorage:", userFromStorage);
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục user từ storage:", error);
        localStorage.removeItem("user");
      }

      // 2. Kiểm tra với server, nhưng không đặt loading = false ngay lập tức
      try {
        const isAuthenticated = await checkAuth();

        // Nếu không xác thực trên server nhưng có dữ liệu local
        if (!isAuthenticated && userFromStorage) {
          console.log("Local user exists but not authenticated with server");
          // Không xóa local data ngay trừ khi ở admin page
          if (
            typeof window !== "undefined" &&
            window.location.pathname.includes("/admin")
          ) {
            console.log("On admin page with invalid auth, will redirect");
            // Thêm delay để tránh redirect loops
            setTimeout(() => handleAuthError(), 500);
          }
        } else if (!isPublicRoute) {
          // Chỉ redirect khi không phải trang public và không có thông tin đăng nhập
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking auth on init:", error);
        if (!window.location.pathname.includes("/login") && !isPublicRoute) {
          localStorage.removeItem("user");
          setUser(null);
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [checkAuth, handleAuthError, router]);

  // Cập nhật Login function
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<User | null> => {
    try {
      setLoading(true);
      clearError();

      const response = await loginApi({ email, password, rememberMe });
      const responseData = response.data as AuthResponse;

      if (responseData.success) {
        // Xử lý trường hợp API trả về user nested hoặc flat
        let userData = responseData.data.user;

        // Nếu không có userData.user, giả định API trả về dữ liệu phẳng
        if (!userData) {
          userData = {
            id: responseData.data.id || "",
            email: responseData.data.email || "",
            role: responseData.data.role || "customer",
            fullName: responseData.data.fullName || "",
          };
        }

        // Kiểm tra dữ liệu bắt buộc
        if (!userData.id || !userData.email) {
          throw new Error("Dữ liệu người dùng không hợp lệ từ server");
        }

        // Tạo user object với vai trò được xác thực
        const validatedUser: User = {
          id: userData.id,
          email: userData.email,
          role: validateUserRole(userData.role),
          fullName: userData.fullName || "",
        };

        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(validatedUser));

        // Cập nhật state
        setUser(validatedUser);

        // Thêm thời gian chờ nhỏ trước khi trả về kết quả
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
        clearError();

        const response = await registerApi({ fullName, email, password });
        const responseData = response.data as AuthResponse;

        if (responseData.success) {
          // Xử lý trường hợp API trả về user nested hoặc flat
          const userData = responseData.data.user || {
            id: responseData.data.id || "",
            email: responseData.data.email || "",
            role: responseData.data.role || "customer",
            fullName: responseData.data.fullName || "",
          };

          // Kiểm tra dữ liệu bắt buộc
          if (!userData.id || !userData.email) {
            throw new Error("Dữ liệu người dùng không hợp lệ từ server");
          }

          // Tạo user object với vai trò được xác thực
          const validatedUser: User = {
            id: userData.id,
            email: userData.email,
            role: validateUserRole(userData.role),
            fullName: userData.fullName || "",
          };

          // Lưu thông tin user
          localStorage.setItem("user", JSON.stringify(validatedUser));
          setUser(validatedUser);
        } else {
          setError(responseData.message || "Đăng ký thất bại");
        }
      } catch (err: unknown) {
        console.error("Register error:", err);
        // Error handling (keep existing code)
      }
    },
    [clearError]
  );

  // Thêm vào logout function
  const logout = useCallback(async () => {
    try {
      // Gọi API logout
      await logoutApi();

      // Xóa dữ liệu người dùng khỏi localStorage
      localStorage.removeItem("user");

      // Reset user state
      setUser(null);

      // Redirect đến trang đăng nhập
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Ngay cả khi API thất bại, vẫn xóa dữ liệu local để đảm bảo logout
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  // Tính toán isAuthenticated dựa vào user
  const isAuthenticated = user !== null;

  const value = {
    user,
    loading,
    error,
    isAuthenticated, // Thêm trường này vào value
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
