import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Yến Sào Thủ Đức - Sản phẩm yến sào chất lượng cao",
  description:
    "Cung cấp các sản phẩm yến sào tự nhiên, nguyên chất với chất lượng đảm bảo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Không sử dụng redirect
  return children;
}
