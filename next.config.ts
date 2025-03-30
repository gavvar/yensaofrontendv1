import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost", // Backend development server
      // Thêm domain production của bạn ở đây nếu có
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      // Thêm cấu hình cho production server nếu có
    ],
  },
};

export default nextConfig;
