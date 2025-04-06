import type { Metadata } from "next";

// Metadata tĩnh
export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
  description: "Xem thông tin chi tiết đơn hàng của bạn",
};

export default function OrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
