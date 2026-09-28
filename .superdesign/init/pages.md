# Page Dependency Trees

## `/` — Home / conversion funnel
Entry: `app/page.tsx`
Dependencies:
- `app/page.tsx`
  - `components/lead-flow-provider.tsx`
    - `components/forms/lead-qualification-dialog.tsx`
      - `components/lead-action-button.tsx`
      - `lib/properties/data.ts`
      - `lib/chat/options.ts`
      - `lib/leads/attribution.ts`
      - `types/lead.ts`
    - `components/chat/chat-assistant.tsx`
      - `lib/chat/options.ts`
      - `lib/chat/demo-flow.ts`
      - `lib/leads/attribution.ts`
      - `lib/properties/data.ts`
      - `lib/leads/schema.ts`
  - `components/landing/site-header.tsx`
    - `components/landing/brand-mark.tsx`
    - `components/landing/mobile-navigation.tsx`
    - `components/lead-action-button.tsx`
  - `components/landing/hero.tsx`
    - `components/lead-action-button.tsx`
    - `public/images/hero-exterior.webp`
  - `components/landing/value-strip.tsx`
  - `components/landing/property-section.tsx`
    - `components/landing/property-card.tsx`
      - `components/lead-action-button.tsx`
      - `lib/properties/data.ts`
    - `lib/properties/data.ts`
  - `components/landing/property-finder.tsx`
    - `components/lead-action-button.tsx`
  - `components/landing/how-it-works.tsx`
  - `components/landing/about-section.tsx`
    - `components/lead-action-button.tsx`
  - `components/landing/consultation-section.tsx`
    - `components/lead-action-button.tsx`
  - `components/landing/faq-section.tsx`
    - `components/lead-action-button.tsx`
  - `components/landing/final-cta.tsx`
    - `components/lead-action-button.tsx`
  - `components/landing/site-footer.tsx`
    - `components/landing/brand-mark.tsx`
  - `lib/config.ts`
  - `app/globals.css`

The page is a single responsive funnel with local anchor navigation, a reusable lead qualification dialog, six example property cards, an assistant drawer, consultation action, FAQs, and footer.

## `/privacy`
Entry: `app/privacy/page.tsx`; shared root layout and global styles.

## `/terms`
Entry: `app/terms/page.tsx`; shared root layout and global styles.
