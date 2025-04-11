"use client";

import React from "react";
import { AuthProvider } from "@/contexts/authContext";
import AdminDashboardLayout from "./AdminDashboardLayout";

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </AuthProvider>
  );
}
