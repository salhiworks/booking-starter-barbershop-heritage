// Responsive variants of the website's own default photos, keyed by the
// default `src` used in src/content/site.ts. Sources and processing: PHOTOS.md.

export interface PhotoSet {
  avif: string;
  webp: string;
  width: number;
  height: number;
}

export interface PhotoVariants extends PhotoSet {
  /** Optional art-directed crop for narrow screens (below 1000px). */
  narrow?: PhotoSet;
}

export const PHOTO_VARIANTS: Readonly<Record<string, PhotoVariants>> = {
  '/photos/hero-shop-1080.webp': {
    avif: '/photos/hero-shop-720.avif 720w, /photos/hero-shop-1080.avif 1080w, /photos/hero-shop-1420.avif 1420w',
    webp: '/photos/hero-shop-720.webp 720w, /photos/hero-shop-1080.webp 1080w, /photos/hero-shop-1420.webp 1420w',
    width: 1080,
    height: 864,
    narrow: {
      avif: '/photos/hero-shop-tall-480.avif 480w, /photos/hero-shop-tall-720.avif 720w, /photos/hero-shop-tall-1000.avif 1000w',
      webp: '/photos/hero-shop-tall-480.webp 480w, /photos/hero-shop-tall-720.webp 720w, /photos/hero-shop-tall-1000.webp 1000w',
      width: 720,
      height: 900,
    },
  },
  '/photos/shop-chairs-1280.webp': {
    avif: '/photos/shop-chairs-800.avif 800w, /photos/shop-chairs-1280.avif 1280w, /photos/shop-chairs-1920.avif 1920w',
    webp: '/photos/shop-chairs-800.webp 800w, /photos/shop-chairs-1280.webp 1280w, /photos/shop-chairs-1920.webp 1920w',
    width: 1280,
    height: 853,
  },
  '/photos/shop-lather-720.webp': {
    avif: '/photos/shop-lather-480.avif 480w, /photos/shop-lather-720.avif 720w, /photos/shop-lather-1080.avif 1080w',
    webp: '/photos/shop-lather-480.webp 480w, /photos/shop-lather-720.webp 720w, /photos/shop-lather-1080.webp 1080w',
    width: 720,
    height: 900,
  },
};
