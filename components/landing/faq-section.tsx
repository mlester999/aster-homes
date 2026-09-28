import { ArrowUpRight, CalendarDays } from "lucide-react";
import { ChatActionButton, LeadActionButton } from "@/components/lead-action-button";

const questions = [
  { question: "How do I start?", answer: "Choose Find My Home or open the Aster Assistant. A few short questions will help us understand what you are looking for." },
  { question: "How does your home-search support work?", answer: "We collect your preferences so an advisor has a useful starting point, then they can help identify options that fit your needs." },
  { question: "Can I book a consultation?", answer: "Yes. Request a consultation here and we’ll capture your preferences. If an external booking link is configured, you can use it directly." },
  { question: "Can I change my property preferences?", answer: "Of course. You can update your preferences any time by submitting a new inquiry or starting another assistant conversation." },
  { question: "Can you help with financing?", answer: "You can tell us if you’d like financing assistance. Aster Homes cannot assess loan eligibility or provide financial advice." },
  { question: "What happens after I submit an inquiry?", answer: "Your request is saved by this site. Follow-up and booking options depend on the contact channels currently configured." },
  { question: "Will I see live property listings here?", answer: "This site does not publish a live property catalog. An advisor can confirm current options, pricing, and availability during a conversation." },
];

export function FAQSection() {
  return (
    <section id="faq" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 xl:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_1fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">A few helpful answers</p>
          <h2 className="font-display mt-3 text-4xl leading-tight tracking-[-0.025em] text-aster-ink sm:text-5xl">Questions, answered.</h2>
          <p className="mt-4 text-sm leading-6 text-aster-muted">Still curious? The Aster Assistant can help you find a starting point.</p>
          <ChatActionButton className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-aster-forest hover:text-aster-forest-deep">Talk with Aster Assistant <ArrowUpRight size={16} aria-hidden="true" /></ChatActionButton>
          <LeadActionButton source="booking" sourceDetail="FAQ section" className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            <CalendarDays size={15} aria-hidden="true" /> Request a consultation <ArrowUpRight size={15} aria-hidden="true" />
          </LeadActionButton>
        </div>
        <div className="divide-y divide-aster-border border-y border-aster-border">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold text-aster-ink">
                {question}<span className="text-xl font-normal text-aster-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-[650px] text-sm leading-6 text-aster-muted">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
