import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/landing/brand-mark";
import { canonicalSiteUrl } from "@/lib/config";

const siteUrl = canonicalSiteUrl().replace(/\/+$/, "");
const description = "Terms for the Aster Homes home-search inquiry site.";

export const metadata: Metadata = {
  title: "Terms",
  description,
  alternates: { canonical: `${siteUrl}/terms` },
  openGraph: {
    type: "website",
    siteName: "Aster Homes",
    title: "Terms | Aster Homes",
    description,
    url: `${siteUrl}/terms`,
    images: ["/images/hero-exterior.webp"],
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-aster-paper">
      <header className="border-b border-aster-border bg-aster-white"><div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 sm:px-8"><BrandMark /><Link href="/" className="text-sm font-medium text-aster-forest hover:underline">Back to Aster Homes</Link></div></header>
      <article className="mx-auto max-w-[800px] px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">Aster Homes</p>
        <h1 className="font-display mt-2 text-5xl text-aster-ink">Terms of use</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-[#566158]">
          <section><h2 className="text-base font-semibold text-aster-ink">Aster Homes</h2><p className="mt-2">Aster Homes is a concept brand and does not claim to be a licensed real-estate brokerage. The information on this site is provided for general illustration and does not create an agency or brokerage relationship.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">Property information</h2><p className="mt-2">This site does not publish a live listing catalog or represent a specific asking price or property availability. Confirm current property details with a licensed professional before making a decision.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">No professional advice</h2><p className="mt-2">Site content is not real-estate, legal, mortgage, tax, investment, or financial advice. No financing approval, investment return, availability, or transaction outcome is promised.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">Inquiries</h2><p className="mt-2">Submitting contact information asks Aster Homes to respond to your property or consultation request. It does not subscribe you to unrelated marketing. External services are used only when configured, and the site reports their connection status.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">Availability</h2><p className="mt-2">Some booking and follow-up options depend on external service configuration. Their current status is shown in the interface when relevant.</p></section>
        </div>
        <p className="mt-10 text-xs text-aster-muted">Last updated September 2026.</p>
      </article>
    </main>
  );
}
