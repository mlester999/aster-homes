import { LeadActionButton } from "@/components/lead-action-button";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";

const links = [
  ["Properties", "#properties"],
  ["How it works", "#how-it-works"],
  ["About", "#about"],
  ["FAQ", "#faq"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-aster-border/90 bg-aster-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 xl:px-12">
        <BrandMark />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-[13px] font-medium text-[#566158] lg:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="transition-colors hover:text-aster-forest">{label}</a>)}
        </nav>
        <div className="ml-auto hidden lg:block">
          <LeadActionButton source="landing_form" sourceDetail="Header" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            Find my home <ArrowUpRight size={16} aria-hidden="true" />
          </LeadActionButton>
        </div>
        <MobileNavigation />
      </div>
    </header>
  );
}
