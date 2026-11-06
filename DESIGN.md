# Northline Barbers — visual system ("Cut List")

## Concept

**The price list is the design.** The page reads like a well-run modern shop:
a poster headline beside a photograph of the shop at work, then the services
and prices set large, every row a way into booking. The palette comes from the
barbershop counter itself — porcelain tile, chrome, ink, and the deep blue of
the disinfectant jar — not from nostalgia. No gold, no poles, no "est." dates,
no gentlemen's-club clichés.

One focal point per screen. The poster face is spent in three places only —
the hero headline, the service names, the closing line; section titles are a
calmer semi-condensed sentence case. One type family, one action colour.

## Type

| Role | Face | Why |
|---|---|---|
| Display, names, text and UI | **Archivo** (variable: width 62–125 %, weight 100–900) — `@fontsource-variable/archivo/wdth.css` | One family carries the whole page through its *width* axis: 62 % uppercase for the poster lines (hero headline, closing line), 75 % uppercase for service names, 87 % sentence case for section titles, barber names and the address, 100 % for reading text. |
| Facts: times, prices, durations, labels | **IBM Plex Mono** 400/500/600 — `@fontsource/ibm-plex-mono` | Tabular figures: prices and times line up and scan quickly. Used small, uppercase, tracked 0.08 em for labels. |
| Heading option "High-contrast serif" | **DM Serif Display** 400 — `@fontsource/dm-serif-display` | For an owner who wants a finer, editorial heading. Downloaded only when chosen. |

All faces are self-hosted (fontsource, `font-display: swap`); the browser
downloads only the subsets the page uses. The owner's heading style
(`brand.headings`) maps to `html[data-headings]`:

| Stored value | Label in the dashboard | Look |
|---|---|---|
| `slab` (default) | Condensed poster | Archivo 62 % width, 860 weight, uppercase |
| `grotesk` | Plain grotesk | Archivo 100 % width, 800 weight, sentence case |
| `serif` | High-contrast serif | DM Serif Display, sentence case |

The stored values are those of the first design (Heritage), so an owner's
saved choice stays valid; only the look behind each value changed.

## Colour

| Token | Value | Use |
|---|---|---|
| `--tile` | `#ECEEEC` | page ground (porcelain tile) |
| `--tile-deep` | `#DFE3E2` | bands (Kind words), chosen cards, icon buttons |
| `--white` | `#FAFBFA` | the menu band, cards, the booking sheet |
| `--ink` | `#121417` | text, the rules that carry meaning |
| `--steel` | `#545C63` | secondary text |
| `--rule` | `#C3CACC` | hairlines (decorative only) |
| `--field-border` | `#7D868D` | inputs, day and time buttons — non-text UI ≥ 3:1 |
| `--brand-dark` (owner: `brand.board`, "Dark colour") | `#121417` | the shop band, the footer, headings |
| `--action` (owner: `brand.accent`, "Action colour") | `#2A4A8F` | every Book / Continue button, chosen times, the visit-step numbers, focus ring |
| `--error` / `--success` | `#A3261D` / `#17683F` | validation, status |

Checked text/background pairs (WCAG 2.x ratio, computed by script):

| Text on background | Ratio |
|---|---|
| ink on tile / white / tile-deep | 15.8 / 17.8 / 14.3 |
| steel on tile / white / tile-deep | 5.8 / 6.6 / 5.3 |
| white on action (buttons) · action on tile (large numerals) | 8.5 · 7.3 |
| white (`--on-dark`) on brand-dark | 17.8 |
| error on tile / white / its wash | 6.3 / 7.1 / 6.1 |
| success on tile | 5.8 |
| field-border on white / tile (UI, not text) | 3.6 / 3.2 |

Owner colours are validated by the dashboard: the dark colour against
`#ECEEEC` at 7:1 (it carries white and muted text), the action colour against
white at 4.5:1. The action colour is used for fills, the focus ring and large
text only — never for small text on tile — so a light owner choice can't drop
small text below AA. Owners who saved a colour under the first design keep it:
a saved bottle green becomes the dark colour, a saved oxblood the action colour.

Dashboard accent (`src/admin-theme.css`): jar blue. Light `#1F55C9` with white
text (6.6:1 on white — a touch brighter than the site's `#2A4A8F` so it holds
up beside the dashboard's coloured status chips); Dark `#9DB8F2` with
`#0B1530` text (8.9:1 on `#18181b`, 9.1:1 text).

## Space and type scale

4 px base. Spacing tokens `--space-1 … --space-10`:
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px. Sections breathe with
`--section-pad: clamp(64px, 9vw, 128px)`; the page is at most 1360 px wide.

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 12 px | mono labels, durations |
| `--text-sm` | 15 px | secondary lines |
| `--text-base` | 17 px | body |
| `--text-lg` | 17 → 20 px | ledes |
| `--text-xl` | 22 → 32 px | service and barber names |
| `--text-price` | 20 → 26 px | prices (mono) |
| `--text-name` | 24 → 32 px | barber names |
| `--text-2xl` | 36 → 64 px | section titles (sentence case) |
| `--text-3xl` / `--text-3xl-wide` | 48 → 88 px / 80 → 128 px (98 at 1280) | the hero headline (phones and tablets / beside the photo) |
| `--text-cta` | 44 → 96 px | the closing line |

Line heights: display 0.88–0.92, body 1.55. Measure: 34–62 characters.

## Shape, rules and depth

- **Radius:** pill buttons; 4 px on photos; 8 px on cards, inputs, days and
  times; 16 px on the top of the phone booking sheet.
- **Rules:** a 2 px ink rule opens every list that carries meaning (the cut
  list, the hours, the booking steps, the reviews); 1 px hairlines between rows.
- **Elevation:** flat. Only things that float get a shadow: the booking sheet
  and its summary bar.
- **Photos:** always in fixed-ratio frames (`aspect-ratio` + `object-fit:
  cover`): hero 5:4 beside the words from 720 px, with its own 4:5 crop
  edge to edge on phones (`<picture media>`, `narrow` in `photo-variants.ts`);
  the shop 16:9 (4:3 on phones); details, barber portraits and the shopfront 4:5.

## Composition

Mobile first; layouts open up at 720 px and 1000 px (a 1024 px laptop gets the
two-column layout). Narrow phones get refinements below 460 px and 380 px.

1. **Header** — sticky and translucent: the shop name as a condensed wordmark,
   section links from 1000 px, and **Book at every width**.
2. **Hero** — kicker, the poster headline, the lede, "Book an appointment"
   with the next open chair (from the engine) beside it, and a link to all the
   services and prices. Wide: 6/6 split, the photo a near-square 5:4 frame
   centred on the words, all of it above the fold at 1280 × 800. Phones: the
   words first, then the photo's taller crop edge to edge.
3. **The menu** — every service on white: name, duration, description, price
   and an arrow chip; two columns on wide screens. Rows invert to ink on hover.
   Owner service photos follow as plates captioned with the service name.
4. **Book a chair (#book)** — how booking works in three steps and the button
   that opens the booking sheet; while online booking is off, the shop's
   contact details instead. Every Book button lands here in that case.
5. **The barbers** — a roster: name, speciality, bio, labelled as sample
   profiles until the owner saves the team. A portrait appears only when the
   owner adds one — never a stand-in photo.
6. **The shop** — the dark band: the wide room photo, notes and a detail photo.
7. **A visit, start to finish** — the owner's visit steps on the light ground,
   numbered because they are a real sequence.
8. **Kind words** — only once the owner has saved real quotes; never examples
   on the public site.
9. **Hours & directions** — the address, open-now line, directions and
   contact links; the hours table from the engine with today marked; the
   owner's shopfront photo when set. In the Live Demo and preview mode a tag
   says the details are a fictional shop's.
10. **Footer** — the closing line (the hero headline again, as a sign-off)
   with the Book button on the deeper tile band, then the shop's details on
   the dark colour and a discreet Staff login.

While online booking is off (or can't load), every general Book button says
"How to book" and leads to the `#book` section's contact details.

## The booking sheet

A native modal `<dialog>` at `#book` (`src/components/booking/BookingSheet.tsx`,
helper `src/lib/dialog.ts` — the same pattern as the Atelier starter):
full height on phones (94 dvh, rounded top), a 560 px panel on the right from
900 px. Every Book action opens it; ✕, Esc, Back or a click beside the panel
close it, and focus returns to the button that opened it. The flow stays
mounted while closed, so a chosen time — or a held one at the code step — is
still there when it opens again.

Inside: a four-segment progress bar, the step title, a "chosen" card with
Change, the step, and a summary bar pinned to the bottom (service · price,
day · time, Continue). Days: a 14-day strip starting today (counts of open
times from the engine's month data; closed and full days dashed), Month for
anything later. Times: morning / afternoon / evening listed together with
counts, or as tabs on a day with more than 18 times.

## Motion

Few and purposeful. Tokens: `--dur-fast 160ms`, `--dur-base 240ms`,
`--dur-slow 560ms`; `--ease-out cubic-bezier(.2,.8,.2,1)`.

- Hero entrance: kicker, headline, lede and action rise 14 px and fade in,
  staggered 70 ms. Content is never hidden waiting for JavaScript.
- Cut list rows: the signature hover — the row inverts to ink, slides its
  content in 16 px and fills the arrow chip with the action colour.
- The booking sheet slides up (phones) or in from the right (wide); each step
  slides in 12 px.
- Nothing scroll-jacks, nothing animates on scroll, nothing delays booking.
- `prefers-reduced-motion: reduce` turns every animation and transition off
  and disables smooth scrolling.

## Photography

Natural colour by default: the owner's photos appear exactly as uploaded.
The owner can choose black and white for every photo (Website → Brand →
Photos, `brand.photos` → `html[data-photos='mono']` →
`--photo-filter-mono: grayscale(1) contrast(1.1) brightness(1.02)` on
`.frame img`), so photos from different sources read as one set.

Direction: the shop at work with enough of the room around it — light,
people mid-task, no extreme close-ups of ears, clippers or the back of a head,
no poles, no other businesses' logos. Sources and licences: `PHOTOS.md`.
