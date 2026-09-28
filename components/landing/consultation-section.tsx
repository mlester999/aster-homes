import { ArrowUpRight, CalendarDays } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

export function ConsultationSection({ bookingUrl }: { bookingUrl: string | null }) {
  return (
    <section id="consultation" className="scroll-mt-24 border-y border-aster-border bg-[#F0EAE0] py-16 md:py-20">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between xl:px-12">
        <div className="max-w-[650px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">When you’re ready</p>
          <h2 className="font-display mt-3 text-4xl leading-tight tracking-[-0.025em] text-aster-ink sm:text-5xl">Make room for a good conversation.</h2>
          <p className="mt-4 max-w-[540px] text-sm leading-6 text-aster-muted">Talk through your search with an advisor. We’ll find a useful next step and make the conversation feel clear.</p>
        </div>
        {bookingUrl ? (
          <a href={bookingUrl} target="_blank" rel="noreferrer" className="action-control inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-aster-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            <CalendarDays size={16} aria-hidden="true" /> Book a consultation <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ) : (
          <LeadActionButton source="booking" sourceDetail="Consultation section" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg bg-aster-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            <CalendarDays size={16} aria-hidden="true" /> Request a consultation <ArrowUpRight size={15} aria-hidden="true" />
          </LeadActionButton>
        )}
      </div>
    </section>
  );
}
