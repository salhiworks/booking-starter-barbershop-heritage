# Barbershop "Cut List" Starter — project rules

(The folder and repository keep the name `barbershop-heritage`, the first
design's name, so published links stay valid.)

A one-page booking website for a barbershop, shipped as **Northline Barbers** (a
fictional shop in Brooklyn, NY) for the owner to make their own. Its identity
lives in `src/site.config.ts`; `CUSTOMIZE.md` is the prompt that personalizes it.
Built around the **Profit Studio Booking Engine** (`@profitstudio/booking-engine`
**2.0.0-beta.3**, pinned; lock in `booking-engine.lock.json`). The engine owns the
booking system; this project owns the public website's design.

Read before changing anything booking-related:
`BOOKING_ENGINE.md` (engine-owned, replaced by `npx booking-engine sync`) and
`node_modules/@profitstudio/booking-engine/docs/INTEGRATION.md` (the contract —
it wins over anything here on technical points). API reference: the package's
`dist/*.d.ts`. Treat the engine as a third-party package.

## The Live Demo layer — leave it alone

- `src/demo/` is the public Live Demo's in-browser engine and sample data. Only
  `npm run dev:demo` / `npm run build:demo` use it (`vite --mode demo` defines
  `__BOOKING_DEMO__`); in every other build it is compiled out. Never read, edit
  or "fix" it while customizing the website.
- Keep the `__BOOKING_DEMO__ ? … : …` branches as they are: the demo wording
  (no email is sent) must stay true in the demo, and the real wording in production.
- `src/demo/engine/` is vendored from the Niche Pack workspace — edit it there.
- `src/admin-main.tsx` passes `emailDelivery={__BOOKING_DEMO__ ? 'none' : undefined}`:
  only the demo's dashboard says no email is sent. Never set it on a real site.

## Engine boundaries (from BOOKING_ENGINE.md)

Always:
- All booking data goes through the ONE instance in `src/lib/engine.ts`.
- Services, prices, durations, opening hours, business name, address, phone and
  email come from the engine (`listServices`, `getBusiness`, `getOpeningTimes`,
  `getAvailability`). Never hard-code them, never put them in the content schema.
- Show only the slots `getAvailability()` returns; send `slot.startsAt` back
  unchanged; show times in the business time zone. Never compute availability
  in the browser (the calendar helpers only reshape server data).
- Book in two steps: `requestBooking()` (time held, 6-digit code emailed) →
  `verifyBooking()`. "Send a new code" = `resendVerificationCode()`; "Choose
  another time" = AWAIT `cancelBookingRequest()`, then reload availability.
- Handle `ok: false` on every call; show success only when `verifyBooking()`
  returned `ok: true`, worded for `pending` vs `confirmed`. Preview mode answers
  `PREVIEW_MODE` — say so, never fake a confirmation.
- When `business.policies.onlineBookingEnabled` is false, show contact details
  instead of the flow.
- Keep the request id in component state only (never storage or the URL).

Never:
- Edit `supabase/migrations/*_booking_engine_*.sql`, `supabase/functions/booking-mailer/`,
  `booking-engine.lock.json` or `node_modules`.
- Query booking tables, call `booking_*` RPCs, or import `@supabase/supabase-js`.
- Put a secret/service-role key or an email-provider key (Resend `re_…`) in a
  `VITE_` variable, source, `.env` files of the site or Git. Send email from the
  website or add an email service — the engine sends every booking email.
- Rebuild, fork or restyle the admin dashboard (`/admin/`, `admin/index.html` →
  `src/admin-main.tsx`). Its only branding is the accent in `src/admin-theme.css`.
- Render owner content as HTML (`dangerouslySetInnerHTML`, `innerHTML`) or build
  image URLs yourself.
- Rename or reuse a content field id once the site is live (the owner's text is
  stored under it). Add a new id instead.

**New booking features (payments, SMS, staff calendars, "choose your barber",
categories…) need a new engine version — never custom database code, tables,
RPCs or Edge Functions in this project.** The engine has ONE calendar per
business: never offer per-barber booking or show staff availability.

## Where the design lives

- `DESIGN.md` — the visual system (concept, type, colour + contrast table, scales,
  motion, photography). Change it together with the tokens.
- `src/styles/tokens.css` — the ONLY file with raw colour, font, size, spacing,
  radius, shadow and motion values. Everything else uses its custom properties
  (media-query breakpoints are the one exception CSS forces).
- `src/styles/base.css` (reset, type, buttons, frames, motion), `site.css`
  (sections), `booking.css` (the flow). Plain CSS, no UI kit.
- `src/components/` — one component per section (`CutRow.tsx` is the shared
  service row of the hero and the menu); `src/components/booking/` — the flow
  (`BookingFlow.tsx` is the state machine; `TimeStep.tsx` + `Calendar.tsx`
  build on the engine's calendar helpers: a 14-day strip from today, one
  `getAvailability` call per month grid it touches).
- Booking opens as a modal `<dialog>` at `#book` (`BookingSheet.tsx`,
  `src/lib/dialog.ts`; history and Esc in `src/App.tsx`). While online booking
  is off or not loadable, every Book button goes to the `#book` section
  (`BookingSection.tsx`) and its contact details instead. Keep `#book-flow` on
  the flow root and `#book` on the section: the workspace browser journeys use them.
- `src/content/site.ts` — what the owner can edit (`defineSiteContent`); its
  defaults are the site's own copy. Imported by `vite.config.ts` too, so it may
  only import from the engine package. Every field must stay rendered.
- `src/lib/preset.ts` (`sitePreset`, preview + dashboard starter data) and the
  preview business in `src/lib/engine.ts` (placeholder Brooklyn contact).
- Photos: `PHOTOS.md` (sources, licences). The processed frames live in
  `public/photos/` with their map in `src/lib/photo-variants.ts`; the original
  downloads are not part of this starter (replace a photo by adding your own
  variants there, or upload it in the dashboard → Website).
  Service photos come only from the owner (`service.image`) — never stock.

## Honesty rules for content

- Barber profiles are labelled samples until the owner saves their own
  (`ownerFields`), and show no photo until the owner adds a portrait. "Kind
  words" is not shown at all until the owner saves real quotes. Never present a photographed
  person as staff; never invent reviews, ratings, awards or "best in town" claims.
- Words: "clients" and "appointments".
- Tone: easygoing, sharp, plain-spoken, welcoming. No macho or "gentlemen's club"
  clichés; no barber poles, skulls or mustache icons.

## Running and checks

```bash
npm run dev                              # preview mode: sample data, banner, nothing saved
npm run dev:demo                         # the Live Demo: in-browser engine + dashboard, nothing sent
npm run build                            # tsc -b + vite build (bakes published content into index.html)
npm run build:demo                       # the public Live Demo build — never the production site
npm run lint                             # oxlint (supabase/functions is ignored)
npx booking-engine doctor --dist dist    # after a build: engine files, env, no secrets in dist
```

No backend is connected yet: no Supabase project, no `.env.local`. Connecting
(INTEGRATION.md §11) and deploying happen only when the owner asks.
