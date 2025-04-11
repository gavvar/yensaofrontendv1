import React from "react";
import { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminClientLayout from "./AdminClientLayout";

// Sử dụng metadata trong server component
export const metadata: Metadata = {
  title: "Admin Dashboard - Yến Sào",
  description: "Trang quản trị hệ thống Yến Sào",
};

// Thêm dynamic = "force-dynamic" để tránh static prerendering
export const dynamic = "force-dynamic";

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AdminClientLayout>
          {children}
          <ToastContainer position="top-right" autoClose={5000} />
        </AdminClientLayout>
      </body>
    </html>
  );
}
