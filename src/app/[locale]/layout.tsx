import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import ClientLayout from "./ClientLayout";
import { Locale, locales } from "@/i18n";

// Font settings
const inter = Inter({ subsets: ["latin"] });

// Metadata tĩnh
export const metadata: Metadata = {
  title: "Yến Sào Thủ Đức",
  description:
    "Cung cấp các sản phẩm yến sào tự nhiên, nguyên chất với chất lượng đảm bảo",
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Xác thực locale là một trong các giá trị được hỗ trợ
  const locale = locales.includes(params.locale as Locale)
    ? params.locale
    : "vi";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
