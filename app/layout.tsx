import type { Metadata } from "next";
import { Playfair_Display, Urbanist } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Premium Classic | Timeless Desserts",
  description:
    "Premium Classic – cake parfaits, banana breads, pastries, shawarma and dessert gifts for every occasion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable}`}
    >
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
