# Northline Barbers — visual system

## Concept

**The board on the wall:** the site reads like a well-kept neighbourhood shop —
a numbered price board in bottle green and brass, ruled like a ledger on warm
paper, with warm tungsten photographs of the work doing the talking.

Heritage modern, never costume: no poles, no mustaches, no "est." dates, no
leather-and-whisky clichés. The heritage comes from the *type* (a sturdy
Clarendon slab), the *rules* (hairlines, double rules, leader dots) and the
*numbering* (sections and menu items are numbered like a printed price list).

## Type

| Role | Face | Why |
|---|---|---|
| Display (default) | **Besley** (variable 400–900, italic) — `@fontsource-variable/besley` | A Clarendon revival: bracketed slab serifs, ball terminals, the lettering of shop fascias and price boards. Set heavy (750–800) with tight tracking for headlines, 600 for menu items. |
| Text / UI | **Schibsted Grotesk** (variable 400–900) — `@fontsource-variable/schibsted-grotesk` | A crisp, slightly condensed news grotesk: very readable at 15–17 px on phones, sturdy numerals for prices and times. |
| Display (owner option "High-contrast serif") | **DM Serif Display** (400, italic) — `@fontsource/dm-serif-display` | For an owner who wants a finer, more editorial heading style. |
| Display (owner option "Modern grotesk") | Schibsted Grotesk 800 | No extra font. |

All faces are self-hosted (fontsource, latin subset, `font-display: swap`);
the browser downloads only the faces the page uses. The heading style is an
owner choice (`brand.headings`) mapped to `html[data-headings]`.

Small caps labels ("signage lettering"): Schibsted Grotesk 600, uppercase,
`letter-spacing: 0.14em`, 12–13 px — always with a rule or a numeral next to it.

## Colour

Warm paper ground, ink text, bottle green as the board and the brand, oxblood
for the one action that matters (Book), brass for metal details.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F3EDE1` | page ground |
| `--paper-deep` | `#E8DFCC` | bands, selected/hover surfaces |
| `--card` | `#FBF8F2` | inputs, slips, cards |
| `--ink` | `#1B1D19` | body text, rules that carry meaning |
| `--ink-muted` | `#55524A` | secondary text |
| `--rule` | `#CDBFA6` | hairlines (decorative only) |
| `--field-border` | `#857760` | input, slot and button outlines — 4.1:1 on card, 3.8:1 on paper (non-text UI needs 3:1) |
| `--green` (owner: `brand.board`) | `#163B2C` | the menu board, footer, headings on paper, selected days/times |
| `--green-deep` | derived: green mixed with 30 % ink | board shadows, footer base |
| `--board-text` / `--board-muted` | `#F3EDE1` / `#C9D2C6` | text on green |
| `--oxblood` (owner: `brand.accent`) | `#6B1E23` | primary buttons (Book a chair, Continue), focus ring on paper |
| `--brass` | `#A8823F` | rules, ornaments, numerals' underline — **never text on paper** |
| `--brass-text` | `#7D5C22` | brass-coloured text on paper/card |
| `--brass-light` | `#D2B274` | numerals, prices and focus ring on green |
| `--error` / `--success` | `#9E2A22` / `#1F5A3E` | inline validation, status |

Checked text/background pairs (WCAG ratio, all ≥ 4.5:1):

| Text on background | Ratio |
|---|---|
| ink on paper / paper-deep / card | 14.6 / 12.8 / 16.0 |
| ink-muted on paper / paper-deep / card | 6.7 / 5.9 / 7.4 |
| green on paper / paper-deep / card | 10.6 / 9.4 / 11.7 |
| paper on green · board-muted on green · brass-light on green | 10.6 · 8.0 · 6.1 |
| paper on oxblood (buttons) · oxblood on paper | 9.8 · 9.8 |
| brass-text on paper / card / paper-deep | 5.3 / 5.8 / 4.6 |
| error on paper / card · success on paper / card | 6.4 / 7.1 · 7.0 / 7.7 |
| paper on ink (preview banner) · brass-light on ink | 14.6 · 8.4 |

Owner colours are validated by the dashboard (`contrastWith: #F3EDE1`): the
board green needs 7:1 (it carries muted text too), the accent 4.5:1. If an
owner's green leaves brass-light below 4.5:1, the site switches board numerals
to paper (`--board-accent`), so text never drops below AA.

Dashboard accent (`src/admin-theme.css`): bottle green, not oxblood — in a work
tool next to red status colours an oxblood button reads as "destructive".
Light `#1E5A40` with white text (8.1:1, 8.1:1 on near-white); Dark `#93CDB4`
with `#0B1A14` text (≥ 9:1 both ways).

## Space and type scale

4 px base. Spacing tokens `--space-1 … --space-10`:
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px. Sections breathe with
`--section-pad: clamp(64px, 9vw, 128px)`.

Type scale (fluid with `clamp`, phone → wide):

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 12.5 px | small caps labels, footnotes |
| `--text-sm-tight` | 14 px | the Morning / Afternoon / Evening control on phones |
| `--text-sm` | 15 px | secondary lines, captions |
| `--text-base` | 17 px | body |
| `--text-lg` | 18 → 21 px | ledes |
| `--text-xl` | 21 → 27 px | menu item names, step titles |
| `--text-2xl` | 34 → 54 px | section titles |
| `--text-3xl` | 44 → 104 px | the hero headline |
| `--text-numeral` | 56 → 128 px | big section numerals |

Line heights: display 0.95–1.05, body 1.55. Measure: 34–62 characters.

## Shape, rules and depth

- **Radius:** almost none — print, not app. `--radius-sm: 2px` on buttons and
  inputs, `--radius-pill` only for the small status chip.
- **Rules:** `--rule-hair` 1 px `--rule` for structure; `--rule-ink` 1 px ink
  for rules that carry meaning (menu rows); double brass rules (3 px double)
  frame the hero ticket and the window sign; dotted brass leaders connect menu
  names to prices.
- **Elevation:** flat. One shadow, `--shadow-raise`, for things that float over
  content: the phone booking bar and the open month calendar.
- **Photos:** always in fixed-ratio frames (`aspect-ratio` + `object-fit:
  cover`) with a 1 px ink keyline; hero 4:5, the shop 3:2, details and sample
  cards 4:5. Captions in small caps under a hairline.

## Composition

Mobile first; layouts open up at 720 px and 1080 px (max width 1320 px). Small
phones get three refinements (420 / 380 / 340 px) so every calendar day stays a
44 px target: the month grid goes edge to edge below 420 px, the week strip
tightens below 380 px and goes edge to edge below 340 px.

1. **Hero** — phone: photo band, then headline, lede and a ruled "next open
   chair" ticket with the one Book action. Wide (≥ 1080 px): 7/5 split, the
   two-line headline left, the photo a tall panel (`--hero-h`) running off the
   right edge of the screen.
2. **The menu** — full-bleed green board inside a double rule: numbered rows,
   leader dots, prices in brass; two newspaper-style columns on wide screens.
   When the owner adds service photos they appear under the board as plates
   captioned with the board's numbers ("No. 02 Skin Fade") — a swipe row on
   phones, modest 4:5 plates on wide screens. With none, the board stands alone
   and is complete; with some, only those services get a plate.
3. **Book a chair** — paper; the flow on the left, an appointment slip on the
   right (wide) or a sticky bar (phone).
4. **The barbers** — three sample cards: a tool photo (labelled "Sample
   photo"), name, speciality, short bio. Never a face.
5. **The shop** — asymmetric: wide photo of the chairs, a portrait detail
   overlapping it, and the numbered routine of a visit.
6. **Kind words** — typographic quotes on a deeper paper band, labelled as
   placeholder examples.
7. **Hours & directions** — the window sign (or the owner's shopfront photo),
   the hours board from the engine with today marked, address and directions.
8. **Footer** — green, the wordmark, contact, a discreet Staff login.

One focal point per screen; whitespace is the luxury.

## Motion

Few, physical, purposeful. Tokens: `--dur-fast 160ms`, `--dur-base 260ms`,
`--dur-slow 520ms`; `--ease-out cubic-bezier(.2,.8,.2,1)` (decelerate, like a
chair settling), `--ease-in-out cubic-bezier(.65,0,.35,1)`.

- Hero entrance: headline, lede and ticket rise 14 px and fade in, staggered
  80 ms (520 ms). Content is never hidden waiting for JavaScript.
- Booking flow: each step slides in 10 px and fades (260 ms); a chosen time
  fills in 160 ms; the appointment slip briefly warms (brass flash, 400 ms)
  when its contents change.
- Nothing scroll-jacks, nothing delays reading or booking.
- `prefers-reduced-motion: reduce` turns every animation and transition off
  and disables smooth scrolling.

## Photography

Tungsten and window light, rich shadows, brass and leather; 35–50 mm close
crops of hands, tools and lather; warm, slightly film-like colour. Every site
photo gets the same grade (`scripts/photos.mjs`: a touch warmer, lifted blacks,
slightly less saturation) so stock from different photographers reads as one
set. Sources and licences: `PHOTOS.md`.
