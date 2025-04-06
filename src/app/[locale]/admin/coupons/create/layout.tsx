import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo mã giảm giá mới | Admin",
  description: "Tạo mã giảm giá mới cho cửa hàng",
};

export default function CreateCouponLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
