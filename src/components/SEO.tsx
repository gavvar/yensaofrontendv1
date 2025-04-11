import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
}

export function generateMetadata({
  title,
  description,
  canonical,
  openGraph,
}: SEOProps): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonical,
      languages: {
        vi: `https://yensao.com/vi${canonical || ""}`,
        en: `https://yensao.com/en${canonical || ""}`,
      },
    },
    openGraph: {
      title: openGraph?.title || title,
      description: openGraph?.description || description,
      images: openGraph?.images || [
        {
          url: "/images/banner.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}
