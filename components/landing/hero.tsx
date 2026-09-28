import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { LeadActionButton } from "@/components/lead-action-button";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1320px] items-center gap-9 px-5 py-9 sm:px-8 sm:py-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:py-16 xl:px-12">
      <div className="max-w-[570px] py-2 lg:py-8">
        <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-aster-muted">
          <span className="h-px w-8 bg-aster-clay" aria-hidden="true" />
          A more thoughtful way home
        </p>
        <h1 className="font-display max-w-[650px] text-[52px] leading-[0.98] tracking-[-0.035em] text-aster-ink sm:text-[64px] lg:text-[72px]">
          Find a home that <em className="font-normal text-aster-forest">fits your life.</em>
        </h1>
        <p className="mt-7 max-w-[470px] text-base leading-7 text-aster-muted sm:text-[17px]">
          Start a considered home search with guidance shaped around your budget, timeline, location, and needs.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <LeadActionButton source="landing_form" sourceDetail="Hero" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-aster-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-aster-forest-deep">
            Find my home <ArrowUpRight size={16} aria-hidden="true" />
          </LeadActionButton>
          <a href="#properties" className="action-control inline-flex min-h-12 items-center justify-center rounded-lg border border-[#D7D8CE] bg-aster-white px-6 text-sm font-semibold text-aster-ink transition-colors hover:border-aster-forest">
            Browse properties
          </a>
        </div>
        <p className="mt-7 max-w-[420px] text-xs leading-5 text-aster-muted">A calm first step, whether you know exactly what you want or are still exploring.</p>
      </div>
      <figure className="relative min-h-[345px] overflow-hidden rounded-2xl bg-aster-sage sm:min-h-[460px] lg:min-h-[580px]">
        <Image
          src="/images/hero-exterior.webp"
          alt="A warm contemporary home surrounded by mature trees and native gardens"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 56vw"
          className="object-cover"
        />
        <figcaption className="absolute bottom-5 left-5 rounded-lg bg-aster-white/95 px-4 py-3 text-xs text-[#566158] shadow-sm sm:bottom-7 sm:left-7">
          <span className="block font-semibold text-aster-ink">Space for what comes next</span>
          <span className="mt-1 block">A place for what comes next</span>
        </figcaption>
      </figure>
    </section>
  );
}
