import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OrderFilters, OrderSortField } from "@/types/orderFilters";

interface UseOrderFiltersProps {
  defaultFilters?: Partial<OrderFilters>;
  shouldUpdateUrl?: boolean;
  storage?: "url" | "session" | "none";
  storageKey?: string;
}

// Define types for filter values
type FilterValuePrimitive = string | number | boolean | null | undefined;
type FilterValue = FilterValuePrimitive | FilterValuePrimitive[];

/**
 * Hook để quản lý các bộ lọc đơn hàng với khả năng lưu trữ trạng thái
 */
export function useOrderFilters({
  defaultFilters = {},
  shouldUpdateUrl = true,
  storage = "url",
  storageKey = "orderFilters",
}: UseOrderFiltersProps = {}) {
  const router = useRouter();
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt" as OrderSortField,
    sortOrder: "desc",
    ...defaultFilters,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Hàm để tạo URL từ filters
  const createUrlFromFilters = useCallback((filterValues: OrderFilters) => {
    const params = new URLSearchParams();

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params.toString();
  }, []);

  // Lưu trữ filters vào sessionStorage
  const saveFiltersToSession = useCallback(
    (filterValues: OrderFilters) => {
      sessionStorage.setItem(storageKey, JSON.stringify(filterValues));
    },
    [storageKey]
  );

  // Tải filters từ sessionStorage
  const loadFiltersFromSession = useCallback(() => {
    const savedFilters = sessionStorage.getItem(storageKey);
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters) as Partial<OrderFilters>;
        setFilters((prevFilters) => ({
          ...prevFilters,
          ...parsedFilters,
        }));
        return parsedFilters;
      } catch (error) {
        console.error("Error parsing saved filters:", error);
      }
    }
    return null;
  }, [storageKey]);

  // Tải filters từ URL
  const loadFiltersFromUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlFilters: Partial<OrderFilters> = {};

      // Parse URL parameters to filters
      params.forEach((value, key) => {
        if (key in filters) {
          const currentValue = filters[key as keyof OrderFilters];

          if (Array.isArray(currentValue)) {
            // If it's already an array, add to it
            if (!urlFilters[key as keyof OrderFilters]) {
              // Use proper typecasting
              urlFilters[key as keyof OrderFilters] =
                [] as unknown as typeof currentValue;
            }
            // Safely access as array
            const array = urlFilters[
              key as keyof OrderFilters
            ] as unknown as unknown[];
            array.push(value);
          } else if (
            key === "page" ||
            key === "limit" ||
            key === "minAmount" ||
            key === "maxAmount"
          ) {
            // Convert numeric values
            urlFilters[key as keyof OrderFilters] = Number(
              value
            ) as unknown as typeof currentValue;
          } else if (key === "sortOrder") {
            // Handle sort order
            urlFilters.sortOrder = value === "asc" ? "asc" : "desc";
          } else {
            // Handle string values
            urlFilters[key as keyof OrderFilters] =
              value as unknown as typeof currentValue;
          }
        }
      });

      return Object.keys(urlFilters).length > 0 ? urlFilters : null;
    }
    return null;
  }, [filters]);

  // Khởi tạo filters từ storage hoặc URL
  useEffect(() => {
    // Chỉ chạy ở client-side
    if (typeof window === "undefined") return;

    let initialFilters: Partial<OrderFilters> | null = null;

    if (storage === "url") {
      initialFilters = loadFiltersFromUrl();
    } else if (storage === "session") {
      initialFilters = loadFiltersFromSession();
    }

    if (initialFilters) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        ...initialFilters,
      }));
    }
  }, [storage, loadFiltersFromUrl, loadFiltersFromSession]);

  // Cập nhật URL khi filters thay đổi (nếu được kích hoạt)
  useEffect(() => {
    if (shouldUpdateUrl && storage === "url" && typeof window !== "undefined") {
      const url = createUrlFromFilters(filters);
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}?${url}`, { scroll: false });
    }

    if (storage === "session") {
      saveFiltersToSession(filters);
    }
  }, [
    filters,
    shouldUpdateUrl,
    storage,
    router,
    createUrlFromFilters,
    saveFiltersToSession,
  ]);

  // Cập nhật filters
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      // Reset về trang 1 khi thay đổi bất kỳ filter nào khác
      ...(newFilters.page ? {} : { page: 1 }),
    }));
  }, []);

  // Cập nhật một trường filter
  const updateFilter = useCallback(
    (field: keyof OrderFilters, value: FilterValue) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [field]: value,
        // Reset về trang 1 khi thay đổi bất kỳ filter nào khác ngoài page
        ...(field === "page" ? {} : { page: 1 }),
      }));
    },
    []
  );

  // Reset filters về giá trị mặc định
  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: filters.limit, // Giữ nguyên số lượng items per page
      sortBy: "createdAt",
      sortOrder: "desc",
      ...defaultFilters,
    });

    if (storage === "session") {
      sessionStorage.removeItem(storageKey);
    }
  }, [filters.limit, defaultFilters, storage, storageKey]);

  // Chuyển trang
  const goToPage = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );

  // Apply toàn bộ bộ lọc
  const applyFilters = useCallback(() => {
    // Có thể thêm logic xử lý trước khi áp dụng filters
    setIsLoading(true);
    // Tạo promise để mô phỏng việc lấy dữ liệu
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        resolve();
      }, 300); // Giả lập delay mạng
    });
  }, []);

  return {
    filters,
    isLoading,
    updateFilters,
    updateFilter,
    resetFilters,
    goToPage,
    applyFilters,
  };
}
