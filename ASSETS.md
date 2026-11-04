# Assets and their terms

The code in this repository is MIT-licensed (`LICENSE`). The assets below are
not: each keeps its own terms.

## Photographs — Pexels License

Six photographs from Pexels, downloaded into the project (never hot-linked),
then cropped and colour-graded for their frames. Only the processed frames are
in this repository; the original downloads are not. Each photo ID was checked
on images.pexels.com on 2026-11-04 (pages: `PHOTOS.md`).

| Files (`public/photos/`) | Pexels photo | Photographer |
|---|---|---|
| `hero-fade-{640,960,1440}.{avif,webp}` | [39559270](https://www.pexels.com/photo/barber-perfecting-a-fade-haircut-close-up-39559270/) | Brian Silva |
| `shop-chairs-{800,1280,1920}.{avif,webp}` | [37764947](https://www.pexels.com/photo/vintage-barber-shop-interior-with-classic-chairs-37764947/) | wal_ 172619 |
| `shop-lather-{480,720,1080}.{avif,webp}` | [16553361](https://www.pexels.com/photo/customer-at-barber-16553361/) | Aarón Lares |
| `tools-clippers-{360,560,840}.{avif,webp}` | [7697712](https://www.pexels.com/photo/tools-at-barbershop-7697712/) | RDNE Stock project |
| `tools-scissors-{360,560,840}.{avif,webp}` | [10317439](https://www.pexels.com/photo/hairdresser-scissors-and-tools-10317439/) | Ron Lach |
| `tools-brass-{360,560,840}.{avif,webp}` | [1319459](https://www.pexels.com/photo/gray-hand-tool-1319459/) | Nikolaos Dimou |

**Terms (Pexels License, https://www.pexels.com/license/).** Free to use and
modify, commercially or not, attribution not required. Not allowed: selling
unaltered copies, redistributing or selling the photos on other stock-photo or
wallpaper platforms, implying endorsement by the people shown, or using them in
an offensive way. **If you build your own business site from this starter,
replace these with photos of your own shop** — nobody shown works at your shop.

## Not in this repository (installed by `npm install`)

| Package | Licence | Notes |
|---|---|---|
| `@profitstudio/booking-engine` 2.0.0-beta.2 | MIT | The booking engine and the packaged dashboard |
| `react`, `react-dom` | MIT | |
| `@fontsource-variable/besley`, `@fontsource-variable/schibsted-grotesk`, `@fontsource/dm-serif-display` | OFL-1.1 | Typefaces |

Fonts are bundled into your build by Vite; the SIL Open Font License 1.1 allows
that (keep the fonts' licence files in `node_modules` — no action needed).

## Original work (MIT, see LICENSE)

- `public/favicon.svg` — drawn in SVG for this starter.
- Every illustration that is code: the painted window sign in Hours & directions (`src/components/Visit.tsx`) and the paper grain (inline SVG noise in `src/styles/tokens.css`).
