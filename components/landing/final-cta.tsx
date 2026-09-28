import { ArrowUpRight, CalendarDays } from "lucide-react";
import { LeadActionButton, ChatActionButton } from "@/components/lead-action-button";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 md:pb-28 xl:px-12">
      <div className="rounded-2xl bg-aster-forest px-7 py-12 text-aster-white sm:px-12 sm:py-16 lg:px-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">A place to begin</p>
        <div className="mt-4 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display max-w-[680px] text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">Ready to find a place that feels right?</h2>
          <div className="flex flex-wrap gap-3">
            <LeadActionButton source="landing_form" sourceDetail="Final CTA" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg bg-aster-white px-6 text-sm font-semibold text-aster-ink transition-colors hover:bg-aster-sage">
              Find my home <ArrowUpRight size={16} aria-hidden="true" />
            </LeadActionButton>
            <LeadActionButton source="booking" sourceDetail="Final CTA" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              <CalendarDays size={15} aria-hidden="true" /> Request a consultation
            </LeadActionButton>
            <ChatActionButton className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Chat with Aster Assistant
            </ChatActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}
