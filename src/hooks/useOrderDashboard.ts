import { useState, useEffect, useCallback } from "react";
import { OrderDashboardResponse } from "@/types/order";
import { OrderDashboardParams, DashboardPeriod } from "@/types/orderFilters";
import adminOrderService from "@/services/adminOrderService";

interface UseOrderDashboardProps {
  initialPeriod?: DashboardPeriod;
  compareWithPrevious?: boolean;
  autoLoad?: boolean;
  refreshInterval?: number | null;
}

/**
 * Hook quản lý dữ liệu dashboard đơn hàng
 */
export function useOrderDashboard({
  initialPeriod = "month",
  compareWithPrevious = false,
  autoLoad = true,
  refreshInterval = null,
}: UseOrderDashboardProps = {}) {
  // State
  const [dashboardData, setDashboardData] =
    useState<OrderDashboardResponse | null>(null);
  const [prevPeriodData, setPrevPeriodData] =
    useState<OrderDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<OrderDashboardParams>({
    period: initialPeriod,
    compareWithPrevious,
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(
    async (params: OrderDashboardParams = currentParams) => {
      try {
        setLoading(true);
        setError(null);

        // Gọi API và xử lý response
        const response = await adminOrderService.getDashboard(params);

        // Xử lý trực tiếp OrderDashboardResponse
        setDashboardData(response);

        // Nếu có dữ liệu kỳ trước và yêu cầu so sánh
        if (params.compareWithPrevious && response.comparisonWithPrevious) {
          // Đảm bảo response.comparisonWithPrevious có cấu trúc giống OrderDashboardResponse
          const prevData =
            response.comparisonWithPrevious as OrderDashboardResponse;
          setPrevPeriodData(prevData);
        } else {
          setPrevPeriodData(null);
        }

        // Update current params
        setCurrentParams(params);

        return response;
      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu dashboard";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentParams]
  );

  // Initial fetch
  useEffect(() => {
    if (autoLoad) {
      fetchDashboardData();
    }
  }, [autoLoad, fetchDashboardData]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchDashboardData]);

  // Change period
  const changePeriod = useCallback(
    (newParams: OrderDashboardParams) => {
      return fetchDashboardData(newParams);
    },
    [fetchDashboardData]
  );

  // Toggle comparison with previous period
  const toggleCompareWithPrevious = useCallback(() => {
    const newParams = {
      ...currentParams,
      compareWithPrevious: !currentParams.compareWithPrevious,
    };
    return fetchDashboardData(newParams);
  }, [currentParams, fetchDashboardData]);

  // Calculate percentage change between current and previous period
  const calculateChange = useCallback(
    (currentValue: number, previousValue: number): number => {
      if (previousValue === 0) return currentValue > 0 ? 100 : 0;
      return ((currentValue - previousValue) / previousValue) * 100;
    },
    []
  );

  // Calculate performance metrics if we have both current and previous data
  const performanceMetrics = useCallback(() => {
    if (!dashboardData || !prevPeriodData) return null;

    return {
      orderCount: {
        current: dashboardData.orderCounts.total,
        previous: prevPeriodData.orderCounts.total,
        change: calculateChange(
          dashboardData.orderCounts.total,
          prevPeriodData.orderCounts.total
        ),
      },
      revenue: {
        current: dashboardData.totalRevenue,
        previous: prevPeriodData.totalRevenue,
        change: calculateChange(
          dashboardData.totalRevenue,
          prevPeriodData.totalRevenue
        ),
      },
      averageOrderValue: {
        current:
          dashboardData.orderCounts.total > 0
            ? dashboardData.totalRevenue / dashboardData.orderCounts.total
            : 0,
        previous:
          prevPeriodData.orderCounts.total > 0
            ? prevPeriodData.totalRevenue / prevPeriodData.orderCounts.total
            : 0,
        change: calculateChange(
          dashboardData.orderCounts.total > 0
            ? dashboardData.totalRevenue / dashboardData.orderCounts.total
            : 0,
          prevPeriodData.orderCounts.total > 0
            ? prevPeriodData.totalRevenue / prevPeriodData.orderCounts.total
            : 0
        ),
      },
      pendingOrders: {
        current: dashboardData.orderCounts.pending,
        previous: prevPeriodData.orderCounts.pending,
        change: calculateChange(
          dashboardData.orderCounts.pending,
          prevPeriodData.orderCounts.pending
        ),
      },
      processingOrders: {
        current: dashboardData.orderCounts.processing,
        previous: prevPeriodData.orderCounts.processing,
        change: calculateChange(
          dashboardData.orderCounts.processing,
          prevPeriodData.orderCounts.processing
        ),
      },
      deliveredOrders: {
        current: dashboardData.orderCounts.delivered,
        previous: prevPeriodData.orderCounts.delivered,
        change: calculateChange(
          dashboardData.orderCounts.delivered,
          prevPeriodData.orderCounts.delivered
        ),
      },
      cancelledOrders: {
        current: dashboardData.orderCounts.cancelled,
        previous: prevPeriodData.orderCounts.cancelled,
        change: calculateChange(
          dashboardData.orderCounts.cancelled,
          prevPeriodData.orderCounts.cancelled
        ),
      },
      // Add more metrics as needed
    };
  }, [dashboardData, prevPeriodData, calculateChange]);

  // Format dashboard period label
  const getPeriodLabel = useCallback(
    (
      period: DashboardPeriod,
      customRange?: { from: string; to: string }
    ): string => {
      const now = new Date();
      switch (period) {
        case "today":
          return "Hôm nay";
        case "yesterday":
          return "Hôm qua";
        case "week":
          return "7 ngày qua";
        case "month":
          return "30 ngày qua";
        case "quarter":
          return `Quý ${
            Math.floor(now.getMonth() / 3) + 1
          }/${now.getFullYear()}`;
        case "year":
          return `Năm ${now.getFullYear()}`;
        case "custom":
          if (customRange) {
            return `${customRange.from} đến ${customRange.to}`;
          }
          return "Tùy chỉnh";
        default:
          return "30 ngày qua";
      }
    },
    []
  );

  // Get chart options and configuration for different chart types
  const getChartOptions = useCallback(
    (chartType: "daily" | "statusDistribution" | "topProducts" = "daily") => {
      switch (chartType) {
        case "daily":
          return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Số đơn hàng",
                },
              },
              y1: {
                position: "right",
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Doanh thu (triệu VNĐ)",
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Ngày",
                },
              },
            },
            plugins: {
              legend: {
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: function (context: {
                    dataset: { label?: string; yAxisID?: string };
                    parsed: { y: number | null };
                  }) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    if (context.parsed.y !== null) {
                      if (context.dataset.yAxisID === "y1") {
                        label +=
                          (context.parsed.y * 1000000).toLocaleString("vi-VN") +
                          " VNĐ";
                      } else {
                        label += context.parsed.y;
                      }
                    }
                    return label;
                  },
                },
              },
            },
          };
        case "statusDistribution":
          return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
              },
              tooltip: {
                callbacks: {
                  label: function (context: {
                    raw: unknown;
                    chart: {
                      data: {
                        datasets: Array<{
                          data: unknown[];
                        }>;
                      };
                    };
                    label: string;
                  }) {
                    const value = context.raw as number;
                    const sum = (
                      context.chart.data.datasets[0].data as number[]
                    ).reduce((a, b) => a + b, 0);
                    const percentage = ((value / sum) * 100).toFixed(1);
                    return `${context.label}: ${value} (${percentage}%)`;
                  },
                },
              },
            },
          };
        case "topProducts":
          return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Số lượng bán ra",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          };
        default:
          return {};
      }
    },
    []
  );

  // Prepare data for daily chart
  const prepareDailyChartData = useCallback(() => {
    if (!dashboardData || !dashboardData.dailyOrders) {
      return { labels: [], datasets: [] };
    }

    // Get date labels
    const labels = dashboardData.dailyOrders.map((item) => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    // Dataset for order counts
    const orderCountDataset = {
      label: "Số đơn hàng",
      data: dashboardData.dailyOrders.map((item) => item.count),
      borderColor: "rgb(255, 159, 64)",
      backgroundColor: "rgba(255, 159, 64, 0.5)",
    };

    // Dataset for revenue
    const revenueDataset =
      dashboardData.dailyOrders[0]?.revenue !== undefined
        ? {
            label: "Doanh thu (triệu)",
            data: dashboardData.dailyOrders.map(
              (item) => (item.revenue || 0) / 1000000
            ), // Convert to millions
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            yAxisID: "y1",
          }
        : null;

    // Include previous period data if available
    const prevPeriodOrdersDataset =
      prevPeriodData && prevPeriodData.dailyOrders
        ? {
            label: "Đơn hàng (kỳ trước)",
            data: prevPeriodData.dailyOrders.map((item) => item.count),
            borderColor: "rgb(201, 203, 207)",
            backgroundColor: "rgba(201, 203, 207, 0.5)",
            borderDash: [5, 5],
          }
        : null;

    const prevPeriodRevenueDataset =
      prevPeriodData &&
      prevPeriodData.dailyOrders &&
      prevPeriodData.dailyOrders[0]?.revenue !== undefined
        ? {
            label: "Doanh thu (kỳ trước)",
            data: prevPeriodData.dailyOrders.map(
              (item) => (item.revenue || 0) / 1000000
            ),
            borderColor: "rgb(153, 102, 255)",
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            borderDash: [5, 5],
            yAxisID: "y1",
          }
        : null;

    // Combine all datasets
    const datasets = [
      orderCountDataset,
      ...(revenueDataset ? [revenueDataset] : []),
      ...(prevPeriodOrdersDataset ? [prevPeriodOrdersDataset] : []),
      ...(prevPeriodRevenueDataset ? [prevPeriodRevenueDataset] : []),
    ];

    return {
      labels,
      datasets,
    };
  }, [dashboardData, prevPeriodData]);

  // Prepare data for status distribution chart
  const prepareStatusChartData = useCallback(() => {
    if (!dashboardData) {
      return { labels: [], datasets: [] };
    }

    const { pending, processing, shipped, delivered, cancelled } =
      dashboardData.orderCounts || {};

    return {
      labels: ["Chờ xác nhận", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"],
      datasets: [
        {
          data: [
            pending || 0,
            processing || 0,
            shipped || 0,
            delivered || 0,
            cancelled || 0,
          ],
          backgroundColor: [
            "rgba(150, 150, 150, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderColor: [
            "rgb(150, 150, 150)",
            "rgb(54, 162, 235)",
            "rgb(255, 159, 64)",
            "rgb(75, 192, 192)",
            "rgb(255, 99, 132)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData]);

  // Prepare data for top products chart
  const prepareTopProductsChartData = useCallback(() => {
    if (!dashboardData?.topProducts || dashboardData.topProducts.length === 0) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: dashboardData.topProducts.map((p) => {
        // Sử dụng productName nếu có, nếu không sẽ dùng name
        const productName = p.productName || p.name;
        return productName.length > 20
          ? productName.substring(0, 20) + "..."
          : productName;
      }),
      datasets: [
        {
          label: "Sản phẩm bán chạy",
          // Sử dụng totalSold nếu có, nếu không sẽ dùng quantity
          data: dashboardData.topProducts.map((p) => p.totalSold || p.quantity),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData]);

  return {
    dashboardData,
    prevPeriodData,
    loading,
    error,
    currentParams,
    fetchDashboardData,
    changePeriod,
    toggleCompareWithPrevious,
    performanceMetrics: performanceMetrics(),
    getPeriodLabel,
    getChartOptions,
    prepareDailyChartData,
    prepareStatusChartData,
    prepareTopProductsChartData,
  };
}
