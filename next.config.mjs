import { createNextIntlPlugin } from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default withNextIntl(nextConfig);
