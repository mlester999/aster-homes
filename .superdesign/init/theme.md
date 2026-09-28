# Theme and Design Tokens

## Compact token summary
- Framework/style: Tailwind CSS v4 in `app/globals.css` via `@import "tailwindcss"` and `@theme inline`.
- Colors: paper `#F6F4EE`; white `#FFFEFA`; ink `#27332B`; forest `#355846`; deep forest `#294637`; muted `#72776E`; stone `#DDD8CB`; border `#E7E3D9`; sage `#E9EDE5`; clay `#A7684F`.
- Fonts: Inter (`--font-inter`) for body/UI; Instrument Serif (`--font-instrument`) for editorial display.
- Spacing: Tailwind's default utility scale; page max width 1320px; common vertical sections 80–112px desktop.
- Shapes: 8–12px buttons, 12px cards, 16px hero and CTA panels.
- Focus: 3px clay outline with 3px offset; reduced motion disables non-essential animations.
- Breakpoints used: Tailwind defaults (`sm`, `md`, `lg`, `xl`); custom chat sheet breakpoint 639px.

## Full source: `app/globals.css`

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter);
  --font-display: var(--font-instrument);
  --color-aster-paper: #f6f4ee;
  --color-aster-white: #fffefa;
  --color-aster-ink: #27332b;
  --color-aster-forest: #355846;
  --color-aster-forest-deep: #294637;
  --color-aster-muted: #72776e;
  --color-aster-stone: #ddd8cb;
  --color-aster-border: #e7e3d9;
  --color-aster-sage: #e9ede5;
  --color-aster-clay: #a7684f;
}

:root {
  color-scheme: light;
  background: #f6f4ee;
  color: #27332b;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
  --aster-safe-bottom: env(safe-area-inset-bottom, 0px);
}

* { box-sizing: border-box; }
html { scroll-padding-top: 88px; }
body { min-height: 100vh; margin: 0; background: #f6f4ee; font-family: var(--font-inter), Inter, Arial, sans-serif; }
button, input, select, textarea { font: inherit; }
button, a, summary { -webkit-tap-highlight-color: transparent; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, summary:focus-visible { outline: 3px solid #a7684f; outline-offset: 3px; }
::selection { color: #27332b; background: #dce4d9; }
.font-display { font-family: var(--font-instrument), Georgia, serif; }
.font-body { font-family: var(--font-inter), Inter, Arial, sans-serif; }
.chat-drawer { height: min(760px, calc(100dvh - 40px)); }
.chat-messages { overscroll-behavior: contain; scrollbar-gutter: stable; }
.modal-scroll { overscroll-behavior: contain; scrollbar-gutter: stable; }
.fade-rise { animation: fade-rise 550ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
@keyframes fade-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 639px) { .chat-drawer { height: calc(100dvh - var(--aster-safe-bottom)); max-height: calc(100dvh - var(--aster-safe-bottom)); } }
@media (prefers-reduced-motion: reduce) { :root { scroll-behavior: auto; } *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; } }
```

## Existing extended design notes
`.superdesign/design-system.md` adds content positioning, spacing rationale, responsive layout, and accessibility guidance. Read that file when designing the landing page.
