import { ArrowUpRight } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

const values = [
  { number: "01", title: "Start with your priorities", detail: "Tell us what matters most, at a pace that feels right." },
  { number: "02", title: "Explore your options", detail: "An advisor can help review current options once your priorities are clear." },
  { number: "03", title: "Choose a useful next step", detail: "Get a thoughtful introduction when you are ready." },
];

export function ValueStrip() {
  return (
    <section aria-label="The Aster Homes approach" className="border-y border-aster-border bg-aster-white">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 sm:px-8 md:grid-cols-3 xl:px-12">
        {values.map((value) => (
          <div key={value.number} className="flex gap-4">
            <span className="font-display text-3xl text-aster-clay">{value.number}</span>
            <div><h2 className="text-sm font-semibold text-aster-ink">{value.title}</h2><p className="mt-1 text-sm leading-6 text-aster-muted">{value.detail}</p></div>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1320px] justify-end px-5 pb-7 sm:px-8 xl:px-12">
        <LeadActionButton source="landing_form" sourceDetail="Value proposition" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-aster-forest px-5 text-sm font-semibold text-aster-forest transition-colors hover:bg-aster-sage">
          Start my home search <ArrowUpRight size={15} aria-hidden="true" />
        </LeadActionButton>
      </div>
    </section>
  );
}
