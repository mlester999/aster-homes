import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/landing/brand-mark";

export const metadata: Metadata = { title: "Privacy", description: "How Aster Homes handles property inquiries and personal information." };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-aster-paper">
      <header className="border-b border-aster-border bg-aster-white"><div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 sm:px-8"><BrandMark /><Link href="/" className="text-sm font-medium text-aster-forest hover:underline">Back to Aster Homes</Link></div></header>
      <article className="mx-auto max-w-[800px] px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">Aster Homes</p>
        <h1 className="font-display mt-2 text-5xl text-aster-ink">Privacy</h1>
        <p className="mt-5 text-sm leading-7 text-aster-muted">This notice explains how information entered on the Aster Homes site is handled. The site does not publish a live property catalog.</p>
        <div className="mt-9 space-y-7 text-sm leading-7 text-[#566158]">
          <section><h2 className="text-base font-semibold text-aster-ink">Information you provide</h2><p className="mt-2">If you submit an inquiry, this site collects your name, email, phone number, home-search preferences, preferred location, optional notes, consent to be contacted about that request, and available page, referrer, and campaign attribution. The Aster Assistant does not ask for financial account details.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">How information is used</h2><p className="mt-2">Information is used to respond to your property inquiry or consultation request. Requesting a response does not subscribe you to unrelated marketing. The form and assistant offer a separate, optional email opt-in for occasional home-search updates; you can unsubscribe from those messages at any time.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">Storage and integrations</h2><p className="mt-2">Inquiry records are stored on the application server and sent to the configured HighLevel CRM to manage the contact, opportunity, and requested follow-up. Search preferences may also be sent to the configured server-side AI provider to prepare a sales-response priority and summary. The AI request does not include your name, email, or phone. Integration credentials stay out of browser code. Search preferences in the assistant may be held in your browser session; contact details are not stored there.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">Property details</h2><p className="mt-2">No specific home, asking price, or availability is represented on this site. An advisor can confirm current options. This site does not claim to be a licensed real-estate brokerage.</p></section>
          <section><h2 className="text-base font-semibold text-aster-ink">Retention</h2><p className="mt-2">This installation’s server-side inquiry store keeps up to 500 recent records. Before a live business uses the site, its legal operating name, contact details, and approved retention period should be added here.</p></section>
        </div>
        <p className="mt-10 text-xs text-aster-muted">Last updated September 2026.</p>
      </article>
    </main>
  );
}
