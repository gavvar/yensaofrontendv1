import apiClient from "@/utils/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";

const adminService = {
  // Thống kê
  getStats: async (endpoint: string) => {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Các methods khác cho admin service...
};

export default adminService;
