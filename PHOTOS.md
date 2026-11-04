# Photographs

Six licensed photographs, all from Pexels under the
[Pexels License](https://www.pexels.com/license/) (free to use and modify,
attribution not required — credited here anyway). No image-generation tool was
used. **This starter ships only the processed frames in `public/photos/`** — the
original downloads and the processing script stay with the source project, so the
repository never redistributes an unaltered copy. The script cropped each one for its frame, applies one shared warm grade (a touch warmer,
lifted blacks, slightly less saturation) so the set reads as one, and writes
AVIF + WebP at three widths to `public/photos/`.

| Served as (`public/photos/`) | Where | Source page | Photographer | Licence | Edits |
|---|---|---|---|---|---|
| `hero-fade-{640,960,1440}.{avif,webp}` | Hero (`hero.photo`) | https://www.pexels.com/photo/barber-perfecting-a-fade-haircut-close-up-39559270/ | Brian Silva | Pexels License | Cropped 4:5 on the fade line, ear and clipper; graded |
| `shop-chairs-{800,1280,1920}.{avif,webp}` | The shop (`shop.photo`) | https://www.pexels.com/photo/vintage-barber-shop-interior-with-classic-chairs-37764947/ | wal_ 172619 | Pexels License | Cropped 3:2 to remove the door frame, a striped cape and a painted sign; graded |
| `shop-lather-{480,720,1080}.{avif,webp}` | The shop, detail (`shop.detail`) | https://www.pexels.com/photo/customer-at-barber-16553361/ | Aarón Lares | Pexels License | Cropped 4:5, removing a logo on the barber's shirt; graded |
| `tools-clippers-{360,560,840}.{avif,webp}` | Sample barber card 1 (site fallback) | https://www.pexels.com/photo/tools-at-barbershop-7697712/ | RDNE Stock project | Pexels License | Cropped 4:5 on the clippers; graded |
| `tools-scissors-{360,560,840}.{avif,webp}` | Sample barber card 2 (site fallback) | https://www.pexels.com/photo/hairdresser-scissors-and-tools-10317439/ | Ron Lach | Pexels License | Cropped 4:5; graded |
| `tools-brass-{360,560,840}.{avif,webp}` | Sample barber card 3 (site fallback) | https://www.pexels.com/photo/gray-hand-tool-1319459/ | Nikolaos Dimou | Pexels License | Cropped 4:5 on the brass bowl and razors; graded |

Masters (downloaded from images.pexels.com at 2400–3200 px; kept with the source project, not shipped in this starter):
`pexels-39559270-brian-silva.jpg`, `pexels-37764947-wal.jpg`,
`pexels-16553361-aaron-lares.jpg`, `pexels-7697712-rdne.jpg`,
`pexels-10317439-ron-lach.jpg`, `pexels-1319459-nikolaos-dimou.jpg`.

## Rules these photos follow

- **Nobody photographed is presented as Northline staff.** The sample barber
  cards show tools, never a face, and carry a "Sample photo" label until the
  owner adds a portrait to each barber (Website → The barbers). The two photos
  with people show a client's head and hands at work; alt text describes them
  as such, and nothing on the page says they are this shop's barbers or
  clients.
- **Service photos are not stock.** The menu shows only the photos the owner
  adds per service in the dashboard (Services); with none, the menu board is
  complete on its own.
- **The shopfront at dusk is painted, not photographed.** Every licensed
  storefront I found showed another shop's name, a barber pole (a cliché the
  brief rules out) or identifiable people. Rather than fake it, the "Hours &
  directions" frame is a designed window sign (name and hours from the engine,
  gilded lettering, tungsten glow). The owner can replace it with a photo of
  the real shopfront: Website → Hours & directions → Shopfront photo.
- Owner uploads never pass through `scripts/photos.mjs`: the engine resizes
  them (WebP, longest side 2400 px) and the site renders them in the same
  fixed-ratio frames with `object-fit: cover`.
