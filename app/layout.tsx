import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { canonicalSiteUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

const siteUrl = canonicalSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Find a home that fits your life | Aster Homes",
    template: "%s | Aster Homes",
  },
  description: "Explore home styles and get thoughtful guidance shaped around your budget, timeline, location, and needs.",
  applicationName: "Aster Homes",
  openGraph: {
    type: "website",
    siteName: "Aster Homes",
    title: "Find a home that fits your life | Aster Homes",
    description: "A thoughtful guided home-finding experience from Aster Homes.",
    url: siteUrl,
    images: [{ url: "/images/hero-exterior.webp", width: 1536, height: 1024, alt: "A contemporary home surrounded by mature trees" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a home that fits your life | Aster Homes",
    description: "Explore home styles and find thoughtful guidance with Aster Homes.",
    images: ["/images/hero-exterior.webp"],
  },
  icons: { icon: "/brand/aster-logo-mark.png", apple: "/brand/aster-logo-mark.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F4EE",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
