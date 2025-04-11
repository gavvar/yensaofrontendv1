import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import ClientLayout from "./ClientLayout";
import { Locale, locales } from "@/i18n";

// Font settings
const inter = Inter({ subsets: ["latin"], display: "swap" });

// Define supported locales statically
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Tách viewport thành export riêng
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Metadata tĩnh
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://yensao.com"
  ),
  title: {
    default: "Yến Sào Thủ Đức - Sản phẩm yến sào chất lượng cao",
    template: "%s | Yến Sào Thủ Đức",
  },
  description:
    "Cung cấp các sản phẩm yến sào tự nhiên, nguyên chất với chất lượng đảm bảo, giàu dinh dưỡng và hương vị thơm ngon.",
  keywords: [
    "yến sào",
    "yến sào Thủ Đức",
    "yến sào nguyên chất",
    "tổ yến",
    "yến nguyên tổ",
  ],
  authors: [{ name: "Yến Sào Thủ Đức" }],
  creator: "Yến Sào Thủ Đức",
  publisher: "Yến Sào Thủ Đức",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://yensao.com",
    siteName: "Yến Sào Thủ Đức",
    title: "Yến Sào Thủ Đức - Sản phẩm yến sào chất lượng cao",
    description:
      "Cung cấp các sản phẩm yến sào tự nhiên, nguyên chất với chất lượng đảm bảo, giàu dinh dưỡng và hương vị thơm ngon.",
    images: [
      {
        url: "/images/banner.png",
        width: 1200,
        height: 630,
        alt: "Yến Sào Thủ Đức - Sản phẩm yến sào chất lượng cao",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yến Sào Thủ Đức - Sản phẩm yến sào chất lượng cao",
    description:
      "Cung cấp các sản phẩm yến sào tự nhiên, nguyên chất với chất lượng đảm bảo",
    images: ["/images/banner.png"],
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "https://yensao.com",
    languages: {
      vi: "https://yensao.com/vi",
      en: "https://yensao.com/en",
    },
  },
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Locale sẽ luôn có giá trị hợp lệ nhờ vào generateStaticParams
  // Tuy nhiên, vẫn nên kiểm tra để đảm bảo an toàn
  const locale = locales.includes(params.locale as Locale)
    ? params.locale
    : "vi";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
