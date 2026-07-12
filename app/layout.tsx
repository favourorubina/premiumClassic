import type { Metadata, Viewport } from "next";
import { Playfair_Display, Urbanist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { absoluteUrl, siteDescription, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sansFont = Urbanist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const defaultTitle = "Premium Classic | Fresh Desserts, Pastries and Gift Boxes";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: "%s | Premium Classic",
  },
  description: siteDescription,
  keywords: [
    "Premium Classic Pastries",
    "cake parfaits",
    "banana bread",
    "pancakes",
    "pastries",
    "shawarma",
    "dessert boxes",
    "WhatsApp food orders",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName,
    title: defaultTitle,
    description: siteDescription,
    images: [
      {
        url: "/logo.jpg",
        width: 512,
        height: 512,
        alt: "Premium Classic Pastries logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
    images: ["/logo.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.jpg", type: "image/jpeg", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "food",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#130f0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl("/logo.jpg"),
    image: absoluteUrl("/logo.jpg"),
    description: siteDescription,
    telephone: "+2347072475343",
    sameAs: ["https://www.instagram.com/premium81985"],
    servesCuisine: ["Desserts", "Pastries", "Shawarma", "Drinks"],
    potentialAction: {
      "@type": "OrderAction",
      target: "https://wa.me/2348089464118",
    },
  };

  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen bg-[#fff9ef] text-[var(--pc-ink)] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
