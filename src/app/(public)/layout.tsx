// filepath: d:\study\yensao\yensao-frontend\src\app\(public)\layout.tsx
import Navbar from "@/components/user/Navbar";
import Footer from "@/components/layout/Footer"; // Tạo component này nếu chưa có

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
