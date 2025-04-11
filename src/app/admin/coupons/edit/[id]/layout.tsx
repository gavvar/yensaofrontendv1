// src/app/[locale]/admin/coupons/edit/[id]/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chỉnh sửa mã giảm giá | Admin",
  description: "Cập nhật thông tin mã giảm giá",
};

export default function EditCouponLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
