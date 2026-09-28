# ASTER HOMES — Conversion Funnel Design System

## Product context

Aster Homes is a concept brand for a residential buyer journey, not a licensed real-estate brokerage. This is a focused single-page inquiry funnel. Home names, images, prices, and locations are illustrative examples, not active inventory. Never show iAcquire pricing, invented testimonials, or unsupported market statistics. Keep a concise illustrative-inventory disclosure near featured homes and in the footer.

## Audience and job to be done

People exploring a home purchase need to find a plausible match, understand what happens next, and ask for help without feeling pushed into a long form. The main actions are Find My Home, Browse Properties, express interest in an illustrative home, talk with the Aster Assistant, and request a consultation.

## Style source and direction

Use the “Serene — Find My Dream” editorial landing-page prompt as a restrained typographic reference: an Instrument Serif display face paired with a practical sans-serif, clear hierarchy, spacious composition, and understated motion. Adapt its dark cinematic palette and video treatment to Aster Homes’ warm, residential brief. The actual page uses still photography, warm paper tones, deep evergreen, and natural materials. It must feel like a thoughtful independent property studio: premium, modern, welcoming, calm, and credible.

## Brand identity

- Wordmark: `ASTER HOMES` in a refined, well-spaced uppercase sans; small `REAL ESTATE` descriptor beneath or beside it.
- Symbol: transparent square mark generated for Aster Homes. Use `/brand/aster-logo-mark.png` wherever the brand mark appears, preserve its transparent background, and pair it with the wordmark where space allows.
- Brand voice: warm, concise, informed, never breathless or pushy.
- Inventory disclosure: visible near the homes and in the footer, never presented as active listings or a real licensed brokerage.

## Tokens

### Color

- Warm paper background: `#F6F4EE`
- White surface: `#FFFEFA`
- Primary ink: `#27332B`
- Forest action: `#355846`
- Forest hover: `#294637`
- Muted text: `#72776E`
- Warm stone: `#DDD8CB`
- Fine border: `#E7E3D9`
- Soft sage surface: `#E9EDE5`
- Terracotta accent: `#A7684F` (rarely; small labels only)
- Success: `#3E6D51`
- Error: `#A14238`

### Typography

- Display: Instrument Serif, regular weight; use sparingly for major headings and property prices.
- Body/UI: Inter, sans-serif; body 16–18px, navigation 13–14px, labels 12–13px.
- H1: 64–76px desktop, 42–50px mobile, tight leading (0.98–1.08), slight negative tracking.
- Section headings: 42–52px desktop, 34–40px mobile.
- Body copy: 16–18px, line-height 1.55–1.7, muted ink for secondary text.
- CTA labels: 14px semibold with 16px icons and consistent 8px icon spacing.
- All text must remain readable over photography; place text on a solid surface or add a quiet overlay rather than sacrificing contrast.

### Spacing, shape, and elevation

- Page content max width: 1280px; use fluid side gutters from 20px mobile to 64px wide desktop.
- Section vertical rhythm: 88–120px desktop, 64–80px mobile.
- Use a 4px base spacing scale with consistent 8px/12px/16px/24px/32px/48px/64px steps.
- Buttons: medium radius 8–12px, 48–54px height; primary forest fill with white text; secondary warm-white fill or fine-outline treatment.
- Cards: 12–16px radius, fine warm border, little or no shadow; let photography and whitespace do the work.
- Drawers/dialogs: 16–20px radius, warm white surfaces, restrained shadow, clear close control.
- Avoid pill-shaped everything, glass effects, excessive gradients, neon, and oversized drop shadows.

## Layout and funnel

1. Sticky compact header with logo, anchor links for Properties, How It Works, About, FAQ, and primary Find My Home action.
2. Hero with one direct headline (“Find a home that fits your life.”), concise supporting copy, primary Find My Home CTA, secondary Browse Properties CTA, and original residential photography.
3. Brief value proposition with helpful buyer-oriented benefits; no fabricated statistics.
4. Six illustrative featured-home cards with distinct photos, believable descriptive details, an inventory disclosure, and clear “I’m Interested” actions.
5. Property finder CTA that opens the qualification flow.
6. How Aster Homes helps / how it works, presented as a simple human process.
7. Why Aster Homes with practical service qualities rather than claims of market leadership.
8. Consultation booking section with a truthful fallback when no booking URL is configured.
9. Short FAQ, final CTA, and discreet disclosure footer.

Keep the experience as one focused landing page; property details belong in an accessible dialog/drawer. The chat assistant remains available while scrolling and never blocks the active form or mobile navigation.

## Components and states

- Primary CTA is forest green. Use action labels that describe the next step.
- Cards have consistent image ratios, unobstructed property names and locations, and compact key facts.
- Qualification uses short steps, a visible progress indicator, large selectable choices, and clear Back/Continue controls.
- Chat assistant has its own authored panel, explicit AI label, visible message history, suggested replies, and an accessible input/send control.
- Forms show inline validation, submitting state, safe errors, and confirmation. Do not silently discard lead data when an integration is unavailable.
- Keep internal CRM and automation diagnostics out of the public inquiry confirmation. Report follow-up availability plainly without promising an unconfigured channel.

## Motion and accessibility

- Use only restrained fade/raise entrance effects, subtle card hover, and short dialog transitions.
- Respect `prefers-reduced-motion`; no autoplay video, parallax, or perpetual motion.
- Maintain WCAG AA contrast, visible keyboard focus, semantic landmarks, labelled inputs, and accessible dialogs.
- Preserve keyboard access and predictable focus for mobile chat, property dialogs, and qualification steps.

## Responsive behavior

- Desktop: airy editorial grid with a strong photo-to-copy relationship and three-column property cards.
- Tablet: two-column cards and balanced hero; navigation remains uncluttered.
- Mobile: stacked hero, full-width CTAs where useful, one-column property cards, compact sticky header, and a near-full-screen chat/form sheet with the input kept visible.
- Never cause horizontal scrolling; keep fixed controls clear of safe areas and form actions.
