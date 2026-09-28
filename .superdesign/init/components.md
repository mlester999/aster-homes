# Shared and Reusable Components

Framework: Next.js App Router, React 19, TypeScript, Tailwind CSS v4, custom UI. No component library is installed.

## LeadActionButton and ChatActionButton
- Source: `components/lead-action-button.tsx`
- LeadActionButton opens the shared qualification flow; ChatActionButton opens the Aster Assistant.

```tsx
"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LeadSource } from "@/types/lead";
import { useLeadFlow } from "@/components/lead-flow-provider";

interface LeadActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  source?: LeadSource;
  propertyId?: string | null;
  sourceDetail?: string | null;
}

export function LeadActionButton({ source = "landing_form", propertyId, sourceDetail, className, onClick, type = "button", ...props }: LeadActionButtonProps) {
  const { openLeadFlow } = useLeadFlow();
  return (
    <button
      {...props}
      type={type}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openLeadFlow({ source, propertyId, sourceDetail });
      }}
    />
  );
}

export function ChatActionButton({ className, onClick, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { openChat } = useLeadFlow();
  return (
    <button
      {...props}
      type={type}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openChat();
      }}
    />
  );
}
```

## BrandMark
- Source: `components/landing/brand-mark.tsx`
- Shared home link for the header and footer.

```tsx
import Image from "next/image";
import Link from "next/link";

export function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" aria-label="Aster Homes home" className="inline-flex items-center gap-3">
      <Image src="/brand/aster-symbol.svg" alt="" width={footer ? 34 : 38} height={footer ? 34 : 38} priority={!footer} />
      <span className="leading-none">
        <span className="block text-[13px] font-semibold tracking-[0.2em] text-aster-ink">ASTER HOMES</span>
        {!footer && <span className="mt-1 block text-[9px] tracking-[0.28em] text-aster-muted">REAL ESTATE</span>}
      </span>
    </Link>
  );
}
```

## PropertyCard
- Source: `components/landing/property-card.tsx`
- Reusable image, property facts, and property-specific inquiry CTA.

```tsx
import Image from "next/image";
import { ArrowUpRight, BedDouble, Ruler, ShowerHead } from "lucide-react";
import type { DemoProperty } from "@/lib/properties/data";
import { LeadActionButton } from "@/components/lead-action-button";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const labels = { house: "House", condo: "Condo", townhouse: "Townhouse" };

export function PropertyCard({ property }: { property: DemoProperty }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-aster-border bg-aster-white transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#d3d9cf]">
      <div className="relative aspect-[1.48] overflow-hidden bg-aster-sage">
        <Image src={property.image} alt={property.image_alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        <span className="absolute left-4 top-4 rounded-full bg-aster-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-aster-forest">Demo home</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-aster-muted">{labels[property.property_type]} · illustrative price</p>
          <p className="shrink-0 text-sm font-semibold text-aster-ink">{currency.format(property.price)}</p>
        </div>
        <h3 className="font-display mt-2 text-3xl leading-tight text-aster-ink">{property.name}</h3>
        <p className="mt-1 text-sm text-aster-muted">{property.location} <span className="text-xs">· fictional location</span></p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#566158]">
          <span className="inline-flex items-center gap-1.5"><BedDouble size={14} aria-hidden="true" />{property.bedrooms} beds</span>
          <span className="inline-flex items-center gap-1.5"><ShowerHead size={14} aria-hidden="true" />{property.bathrooms} baths</span>
          <span className="inline-flex items-center gap-1.5"><Ruler size={14} aria-hidden="true" />{property.floor_area_sqft.toLocaleString()} sq ft</span>
        </div>
        <p className="mt-4 min-h-12 text-sm leading-6 text-aster-muted">{property.description}</p>
        <LeadActionButton source="property_inquiry" propertyId={property.id} sourceDetail={property.name} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-aster-forest hover:text-aster-forest-deep">
          I’m interested <ArrowUpRight size={15} aria-hidden="true" />
        </LeadActionButton>
      </div>
    </article>
  );
}
```
