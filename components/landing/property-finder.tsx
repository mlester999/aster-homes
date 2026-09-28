import { ArrowUpRight, Check } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

const prompts = ["What kind of home are you picturing?", "What budget feels comfortable?", "When would you like to make a move?"];

export function PropertyFinder() {
  return (
    <section className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-20 sm:px-8 md:pb-28 xl:px-12">
      <div className="grid overflow-hidden rounded-2xl bg-aster-sage lg:grid-cols-[1fr_0.8fr]">
        <div className="p-7 sm:p-10 lg:p-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">Your search, made clearer</p>
          <h2 className="font-display mt-4 max-w-[580px] text-4xl leading-tight tracking-[-0.025em] text-aster-ink sm:text-5xl">A few thoughtful questions can make the search feel simpler.</h2>
          <p className="mt-5 max-w-[500px] text-sm leading-6 text-aster-muted">Share what you have in mind and we’ll help you explore options that fit your priorities.</p>
          <LeadActionButton source="landing_form" sourceDetail="Property finder" className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-aster-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            Start finding my home <ArrowUpRight size={16} aria-hidden="true" />
          </LeadActionButton>
        </div>
        <div className="flex flex-col justify-center border-t border-[#D7DED3] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">A good place to begin</p>
          <ul className="mt-5 space-y-4 text-sm text-[#566158]">
            {prompts.map((prompt) => <li key={prompt} className="flex gap-3"><Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-aster-forest" />{prompt}</li>)}
          </ul>
          <p className="mt-6 text-xs leading-5 text-aster-muted">It’s fine if you’re still deciding. We can start there, too.</p>
        </div>
      </div>
    </section>
  );
}
