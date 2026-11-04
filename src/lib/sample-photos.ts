import type { SiteImage } from '@profitstudio/booking-engine';

/**
 * The site's own stand-ins for barber portraits: photos of the tools, never a
 * face, always labelled "Sample photo". A list item cannot carry a default
 * image (INTEGRATION.md §15), so the site supplies these until the owner adds
 * a portrait to each barber in the dashboard.
 */
export const SAMPLE_TOOL_PHOTOS: readonly SiteImage[] = [
  {
    src: '/photos/tools-clippers-560.webp',
    alt: 'Clippers, scissors and a straight razor laid out on a black towel',
    width: 560,
    height: 700,
  },
  {
    src: '/photos/tools-scissors-560.webp',
    alt: 'Two pairs of barber scissors and a straight razor on a wooden counter',
    width: 560,
    height: 700,
  },
  {
    src: '/photos/tools-brass-560.webp',
    alt: 'A shaving brush in a brass bowl beside two straight razors',
    width: 560,
    height: 700,
  },
];
