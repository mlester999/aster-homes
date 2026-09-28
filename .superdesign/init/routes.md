# Routes

## Public pages
- `/` — `app/page.tsx`; Aster Homes conversion landing page. Root layout: `app/layout.tsx`.
- `/privacy` — `app/privacy/page.tsx`; privacy notice.
- `/terms` — `app/terms/page.tsx`; terms notice.
- `/_not-found` — `app/not-found.tsx`; not-found page.

## API routes
- `POST /api/leads` — `app/api/leads/route.ts`; validates and stores qualified inquiries before configured server-side integrations.
- `POST /api/chat` — `app/api/chat/route.ts`; assistant response endpoint.
- `GET /api/demo/activity` — `app/api/demo/activity/route.ts`; masked lead activity endpoint available in demo mode.

## Other route files
- `/demo/activity` — `app/demo/activity/page.tsx`; masked integration-status activity page, guarded by demo mode.
- `/robots.txt` — `app/robots.ts`.
- `/sitemap.xml` — `app/sitemap.ts`.
- `/icon.svg` — `app/icon.svg`.

No router config file is used; routing follows the Next.js App Router filesystem convention.
