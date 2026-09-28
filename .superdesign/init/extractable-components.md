# Reusable Design Components

## BrandMark
- Source: `components/landing/brand-mark.tsx`
- Category: layout
- Description: Home link with emblem and wordmark, used in the shared header and footer.
- Props: `footer` toggles compact footer treatment.
- Hardcoded: Aster Homes name, asset URL, typography, sizes.

## SiteHeader
- Source: `components/landing/site-header.tsx`
- Category: layout
- Description: Sticky desktop navigation with primary inquiry CTA and mobile navigation.
- Props: none.
- Hardcoded: section links and Find my home action.

## MobileNavigation
- Source: `components/landing/mobile-navigation.tsx`
- Category: layout
- Description: Responsive accessible navigation panel with lead-form CTA.
- Props: none.
- Hardcoded: section links, menu icons, CTA label.

## SiteFooter
- Source: `components/landing/site-footer.tsx`
- Category: layout
- Description: Brand, site links, legal links, and property disclosure.
- Props: none.
- Hardcoded: links, legal and disclosure copy.

## LeadActionButton
- Source: `components/lead-action-button.tsx`
- Category: basic
- Description: Consistent button primitive that opens the inquiry flow and attaches source/property context.
- Props: standard button props, `source`, `propertyId`, `sourceDetail`.
- Hardcoded: behavior delegates to shared lead-flow provider.

## ChatActionButton
- Source: `components/lead-action-button.tsx`
- Category: basic
- Description: Button primitive that opens the Aster Assistant.
- Props: standard button props.
- Hardcoded: behavior delegates to shared lead-flow provider.

## PropertyCard
- Source: `components/landing/property-card.tsx`
- Category: basic
- Description: Example home image, summary facts, price, and property-specific inquiry CTA.
- Props: property record.
- Hardcoded: card structure, fact icons, illustrative badge copy.
