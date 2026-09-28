import { ArrowUpRight, CalendarDays } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

const steps = [
  { number: "01", title: "Tell us what matters", body: "A short conversation about your plans, preferences, and timing gives us a helpful starting point." },
  { number: "02", title: "Review what matters", body: "An advisor can help compare current options once your preferences are clear." },
  { number: "03", title: "Choose what comes next", body: "Ask a question, book time with an advisor, or keep exploring until the timing feels right." },
  { number: "04", title: "Meet with an advisor", body: "When you’re ready, we’ll help organize a consultation or viewing request." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-aster-white py-20 md:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 xl:px-12">
        <div className="max-w-[680px]"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">How it works</p><h2 className="font-display mt-3 text-4xl leading-tight tracking-[-0.025em] text-aster-ink sm:text-5xl">A clear path, with a person alongside you.</h2></div>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="border-t border-[#D7D8CE] pt-5">
              <span className="font-display text-4xl text-aster-clay">{step.number}</span>
              <h3 className="mt-4 text-base font-semibold text-aster-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-aster-muted">{step.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <LeadActionButton source="landing_form" sourceDetail="How it works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-aster-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            Tell us what you need <ArrowUpRight size={15} aria-hidden="true" />
          </LeadActionButton>
          <LeadActionButton source="booking" sourceDetail="How it works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-aster-border bg-aster-paper px-6 text-sm font-semibold text-aster-ink transition-colors hover:border-aster-forest hover:text-aster-forest">
            <CalendarDays size={15} aria-hidden="true" /> Request a consultation
          </LeadActionButton>
        </div>
      </div>
    </section>
  );
}
