"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

const links = [
  ["Properties", "#properties"],
  ["How it works", "#how-it-works"],
  ["About", "#about"],
  ["FAQ", "#faq"],
] as const;

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-aster-border bg-aster-white text-aster-ink"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" size={19} /> : <Menu aria-hidden="true" size={19} />}
      </button>
      {open && (
        <div id="mobile-navigation-panel" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(90vw,320px)] rounded-xl border border-aster-border bg-aster-white p-3 shadow-[0_14px_38px_rgba(39,51,43,0.14)]">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-[#566158] hover:bg-aster-sage hover:text-aster-forest">{label}</a>
            ))}
            <LeadActionButton
              source="landing_form"
              sourceDetail="Mobile navigation"
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center rounded-lg bg-aster-forest px-4 text-sm font-semibold text-white hover:bg-aster-forest-deep"
            >Find my home</LeadActionButton>
          </nav>
        </div>
      )}
    </div>
  );
}
