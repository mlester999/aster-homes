# Shared Layout Components

## RootLayout — `app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { canonicalSiteUrl } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

const siteUrl = canonicalSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Find a home that fits your life | Aster Homes", template: "%s | Aster Homes" },
  description: "Explore fictional demo homes and get thoughtful guidance shaped around your budget, timeline, location, and needs. A demonstration experience powered by iAcquire.",
  applicationName: "Aster Homes",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Aster Homes", title: "Find a home that fits your life | Aster Homes", description: "A fictional residential property demonstration with a guided home-finding experience.", url: siteUrl, images: [{ url: "/images/hero-exterior.webp", width: 1536, height: 1024, alt: "A fictional contemporary home surrounded by mature trees" }] },
  twitter: { card: "summary_large_image", title: "Find a home that fits your life | Aster Homes", description: "A fictional residential property demonstration powered by iAcquire.", images: ["/images/hero-exterior.webp"] },
  icons: { icon: "/brand/aster-symbol.svg", apple: "/brand/aster-symbol.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6F4EE" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

## SiteHeader — `components/landing/site-header.tsx`

```tsx
import { LeadActionButton } from "@/components/lead-action-button";
import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";

const links = [["Properties", "#properties"], ["How it works", "#how-it-works"], ["About", "#about"], ["FAQ", "#faq"]] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-aster-border/90 bg-aster-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 xl:px-12">
        <BrandMark />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-[13px] font-medium text-[#566158] lg:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="transition-colors hover:text-aster-forest">{label}</a>)}
        </nav>
        <div className="ml-auto hidden lg:block"><LeadActionButton source="landing_form" sourceDetail="Header" className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-aster-forest px-5 text-[13px] font-semibold text-white transition-colors hover:bg-aster-forest-deep">Find my home <span aria-hidden="true">↗</span></LeadActionButton></div>
        <MobileNavigation />
      </div>
    </header>
  );
}
```

## MobileNavigation — `components/landing/mobile-navigation.tsx`

```tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

const links = [["Properties", "#properties"], ["How it works", "#how-it-works"], ["About", "#about"], ["FAQ", "#faq"]] as const;

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative lg:hidden">
      <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-aster-border bg-aster-white text-aster-ink" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-navigation-panel" onClick={() => setOpen((value) => !value)}>
        {open ? <X aria-hidden="true" size={19} /> : <Menu aria-hidden="true" size={19} />}
      </button>
      {open && (
        <div id="mobile-navigation-panel" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(90vw,320px)] rounded-xl border border-aster-border bg-aster-white p-3 shadow-[0_14px_38px_rgba(39,51,43,0.14)]">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-[#566158] hover:bg-aster-sage hover:text-aster-forest">{label}</a>)}
            <LeadActionButton source="landing_form" sourceDetail="Mobile navigation" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center justify-center rounded-lg bg-aster-forest px-4 text-sm font-semibold text-white hover:bg-aster-forest-deep">Find my home</LeadActionButton>
          </nav>
        </div>
      )}
    </div>
  );
}
```

## SiteFooter — `components/landing/site-footer.tsx`

```tsx
import Link from "next/link";
import { BrandMark } from "./brand-mark";

const footerLinks = [["Properties", "#properties"], ["How it works", "#how-it-works"], ["About", "#about"], ["FAQ", "#faq"]] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-aster-border bg-aster-white">
      <div className="mx-auto max-w-[1320px] px-5 py-9 sm:px-8 xl:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <BrandMark footer />
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs text-[#566158] sm:grid-cols-4">
            {footerLinks.map(([label, href]) => <a key={href} href={href} className="hover:text-aster-forest">{label}</a>)}
            <Link href="/privacy" className="hover:text-aster-forest">Privacy</Link>
            <Link href="/terms" className="hover:text-aster-forest">Terms</Link>
            <Link href="/demo/activity" className="hover:text-aster-forest">Demo activity</Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-aster-border pt-5 text-xs leading-5 text-aster-muted sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[760px]">Fictional demonstration experience powered by iAcquire. Aster Homes and all properties shown are illustrative and do not represent a real brokerage or active listings.</p>
          <p className="shrink-0">© {new Date().getFullYear()} Aster Homes · Demo experience</p>
        </div>
      </div>
    </footer>
  );
}
```
