import React from "react";
import { Metadata } from "next";
import OrderDetailClient from "@/components/orders/OrderDetailClient";

// Định nghĩa kiểu tham số động cho route
type OrderDetailParams = {
  id: string;
  locale: string;
};

// Định nghĩa kiểu props cho Page theo chuẩn Next.js 15
type OrderDetailPageProps = {
  params: OrderDetailParams;
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Hàm tạo metadata cho trang, chạy ở server-side
 */
export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  // Sửa lại hàm để tránh sử dụng biến error
  return {
    title: `Chi tiết đơn hàng #${params.id}`,
    description: `Thông tin chi tiết cho đơn hàng #${params.id}`,
  };
}

/**
 * Component chính của trang - đây là Server Component
 */
export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return <OrderDetailClient id={params.id} locale={params.locale} />;
}
