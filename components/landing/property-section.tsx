import { ArrowUpRight, Building2, CalendarDays, House } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";
import { homeStyleCards, type HomeStyleCard } from "@/lib/properties/data";

const homeStyleIcons: Record<HomeStyleCard["property_type"], typeof House> = {
  house: House,
  condo: Building2,
  townhouse: House,
};

export function PropertySection() {
  return (
    <section id="properties" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-20 sm:px-8 md:py-28 xl:px-12">
      <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">A considered starting point</p>
          <h2 className="font-display mt-3 max-w-[740px] text-4xl leading-tight tracking-[-0.025em] text-aster-ink sm:text-5xl">What kind of home feels right?</h2>
        </div>
        <p className="max-w-[430px] text-sm leading-6 text-aster-muted">Choose a home style to start a guided search. Ask an advisor about current options during a consultation.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {homeStyleCards.map((style) => {
          const Icon = homeStyleIcons[style.property_type];
          return (
            <article key={style.property_type} className="flex min-h-[270px] flex-col rounded-xl border border-aster-border bg-aster-white p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#d3d9cf] sm:p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-aster-sage text-aster-forest">
                <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h3 className="font-display mt-6 text-3xl leading-tight text-aster-ink">{style.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-aster-muted">{style.description}</p>
              <LeadActionButton source="landing_form" sourceDetail={`Home style: ${style.title}`} propertyType={style.property_type} className="mt-6 inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-aster-forest hover:text-aster-forest-deep">
                Start my search <ArrowUpRight size={16} aria-hidden="true" />
              </LeadActionButton>
            </article>
          );
        })}
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-aster-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[560px] text-sm leading-6 text-aster-muted">Share your budget, preferred area, and timing so we can focus the conversation on what matters to you.</p>
        <div className="flex flex-wrap gap-3">
          <LeadActionButton source="landing_form" sourceDetail="Home search preferences" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            Tell us what you need <ArrowUpRight size={16} aria-hidden="true" />
          </LeadActionButton>
          <LeadActionButton source="booking" sourceDetail="Home styles" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-aster-border bg-aster-white px-5 text-sm font-semibold text-aster-ink transition-colors hover:border-aster-forest hover:text-aster-forest">
            <CalendarDays size={16} aria-hidden="true" /> Request a consultation
          </LeadActionButton>
        </div>
      </div>
    </section>
  );
}
