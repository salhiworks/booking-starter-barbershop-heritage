# Photographs

Three licensed photographs, all from Pexels under the
[Pexels License](https://www.pexels.com/license/) (free to use and modify,
attribution not required — credited here anyway). No image-generation tool was
used. **This starter ships only the processed frames in `public/photos/`** — the
original downloads and the processing script stay with the source project, so the
repository never redistributes an unaltered copy. The script cropped each one for its frame, applies one shared warm grade (a touch warmer,
lifted blacks, slightly less saturation) so the set reads as one, and writes
AVIF + WebP at three widths to `public/photos/`.

| Served as (`public/photos/`) | Where | Source page | Photographer | Licence | Edits |
|---|---|---|---|---|---|
| `hero-shop-{720,1080,1420}.{avif,webp}` (5:4) and `hero-shop-tall-{480,720,1000}.{avif,webp}` (4:5, phones) | Hero (`hero.photo`) | https://www.pexels.com/photo/a-barber-trimming-a-beard-7518739/ | Pavel Danilyuk | Pexels License | Two crops of the left of the room, excluding a barber pole; three small Levi's logo stickers on the window and in a mirror removed (filled from the surrounding glass); not graded |
| `shop-chairs-{800,1280,1920}.{avif,webp}` | The shop (`shop.photo`) | https://www.pexels.com/photo/vintage-barber-shop-interior-with-classic-chairs-37764947/ | wal_ 172619 | Pexels License | Cropped 3:2 to remove the door frame, a striped cape and a painted sign; graded |
| `shop-lather-{480,720,1080}.{avif,webp}` | The shop, detail (`shop.detail`) | https://www.pexels.com/photo/customer-at-barber-16553361/ | Aarón Lares | Pexels License | Cropped 4:5, removing a logo on the barber's shirt; graded |

Masters (downloaded from images.pexels.com at 2400–3200 px; kept with the source project, not shipped in this starter):
`pexels-7518739-pavel-danilyuk.jpg` (2400 px working copy), `pexels-37764947-wal.jpg`,
`pexels-16553361-aaron-lares.jpg`.

## Rules these photos follow

- **Nobody photographed is presented as Northline staff.** The sample barber
  profiles are words only — no stand-in portrait, no tools dressed up as a
  person — and are labelled as samples until the owner adds the team with
  their own portraits (Website → The barbers). The hero shows a barber and a
  client at work in a shop; its alt text describes the scene, and nothing on the
  page names them or says they work here.
- **Service photos are not stock.** The menu shows only the photos the owner
  adds per service in the dashboard (Services); with none, the menu is
  complete on its own.
- **No shopfront photo by default.** Every licensed storefront I found showed
  another shop's name, a barber pole (a cliché the brief rules out) or
  identifiable people, so "Hours & directions" shows the address and the hours
  only. The owner can add a photo of the real shopfront: Website → Hours &
  directions → Shopfront photo.
- **Every frame is shown in black and white** by one CSS filter
  (`--photo-filter` in `src/styles/tokens.css`), the owner's uploads included,
  so photos from different sources read as one set. The files themselves keep
  their colour grade.
- Owner uploads never pass through `scripts/photos.mjs`: the engine resizes
  them (WebP, longest side 2400 px) and the site renders them in the same
  fixed-ratio frames with `object-fit: cover`.
