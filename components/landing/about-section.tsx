import { ArrowUpRight } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

const principles = [
  { title: "Clarity", text: "Helpful information, organized around the things you care about.", tone: "bg-aster-sage" },
  { title: "Choice", text: "A way to explore without pressure to decide before you’re ready.", tone: "border border-aster-border bg-aster-white sm:translate-y-8" },
  { title: "Care", text: "A thoughtful human handoff whenever a conversation would help.", tone: "border border-aster-border bg-aster-white" },
  { title: "Context", text: "Space to weigh location, budget, timing, and the details in between.", tone: "bg-[#F0EAE0] sm:translate-y-8" },
];

export function AboutSection() {
  return (
    <section id="about" className="mx-auto grid max-w-[1320px] scroll-mt-24 items-center gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[0.8fr_1fr] xl:px-12">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">A little more human</p>
        <h2 className="font-display mt-3 text-4xl leading-tight tracking-[-0.025em] text-aster-ink sm:text-5xl">Good guidance starts by listening.</h2>
        <p className="mt-5 max-w-[510px] text-sm leading-7 text-aster-muted">Finding a home is personal. Aster Homes is designed to make the early steps feel considered: clear answers, room to compare, and a real person when you want one.</p>
        <LeadActionButton source="booking" sourceDetail="About section" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-aster-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
          Request a consultation <ArrowUpRight size={15} aria-hidden="true" />
        </LeadActionButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {principles.map((principle) => <article key={principle.title} className={`rounded-xl p-6 ${principle.tone}`}><h3 className="font-display text-3xl text-aster-forest">{principle.title}</h3><p className="mt-3 text-sm leading-6 text-[#566158]">{principle.text}</p></article>)}
      </div>
    </section>
  );
}
