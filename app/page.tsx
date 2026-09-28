import type { Metadata } from "next";
import { LeadFlowProvider } from "@/components/lead-flow-provider";
import { AboutSection } from "@/components/landing/about-section";
import { ConsultationSection } from "@/components/landing/consultation-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PropertyFinder } from "@/components/landing/property-finder";
import { PropertySection } from "@/components/landing/property-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ValueStrip } from "@/components/landing/value-strip";
import { canonicalSiteUrl, publicBookingUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Find a home that fits your life",
  description: "Explore home styles and get thoughtful guidance shaped around your budget, timeline, location, and needs.",
  alternates: { canonical: canonicalSiteUrl() },
};

export default function HomePage() {
  const bookingUrl = publicBookingUrl();

  return (
    <LeadFlowProvider bookingUrl={bookingUrl}>
      <SiteHeader />
      <main>
        <Hero />
        <ValueStrip />
        <PropertySection />
        <PropertyFinder />
        <HowItWorks />
        <AboutSection />
        <ConsultationSection bookingUrl={bookingUrl} />
        <FAQSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </LeadFlowProvider>
  );
}
