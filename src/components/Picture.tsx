import type { SiteImage } from '@profitstudio/booking-engine';
import { PHOTO_VARIANTS } from '../lib/photo-variants';

interface PictureProps {
  image: SiteImage;
  /** Must match the frame's rendered width at each breakpoint. */
  sizes: string;
  /** The hero: load at once with high priority. Everything else is lazy. */
  eager?: boolean;
  className?: string;
}

/**
 * The site's own default photos are served as AVIF/WebP at several widths;
 * a photo the owner uploaded (already resized by the engine) renders as one
 * <img>. Either way the surrounding frame fixes the aspect ratio and crops
 * with object-fit, so a replacement never breaks the layout.
 */
export function Picture({ image, sizes, eager = false, className }: PictureProps) {
  const variants = PHOTO_VARIANTS[image.src];
  const loading = eager ? 'eager' : 'lazy';
  const fetchPriority = eager ? 'high' : undefined;

  if (variants) {
    return (
      <picture>
        <source type="image/avif" srcSet={variants.avif} sizes={sizes} />
        <source type="image/webp" srcSet={variants.webp} sizes={sizes} />
        <img
          className={className}
          src={image.src}
          alt={image.alt}
          width={variants.width}
          height={variants.height}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
        />
      </picture>
    );
  }
  return (
    <img
      className={className}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
}
