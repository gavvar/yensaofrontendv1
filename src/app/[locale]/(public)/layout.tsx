// filepath: d:\study\yensao\yensao-frontend\src\app\(public)\layout.tsx
import Navbar from "@/components/user/Navbar";
import Footer from "@/components/user/Footer";

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
