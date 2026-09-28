import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";
import { BrandMark } from "./brand-mark";

const footerLinks = [
  ["Properties", "#properties"],
  ["How it works", "#how-it-works"],
  ["About", "#about"],
  ["FAQ", "#faq"],
] as const;

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
          </nav>
          <LeadActionButton source="booking" sourceDetail="Footer" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            Request a consultation <ArrowUpRight size={15} aria-hidden="true" />
          </LeadActionButton>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-aster-border pt-5 text-xs leading-5 text-aster-muted sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[760px]">Aster Homes is a concept home-search service and does not claim to be a licensed real-estate brokerage. Current availability, pricing, and property details are confirmed by a licensed professional.</p>
          <p className="shrink-0">© {new Date().getFullYear()} Aster Homes</p>
        </div>
      </div>
    </footer>
  );
}
