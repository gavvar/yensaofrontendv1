// filepath: d:\study\yensao\yensao-frontend\src\app\(public)\layout.tsx
import Navbar from "@/components/user/Navbar";
import Footer from "@/components/user/Footer";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Yến Sào Thủ Đức - Sản phẩm yến sào chất lượng cao",
    template: "%s | Yến Sào Thủ Đức",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="relative z-50">
        <Navbar />
      </header>
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
