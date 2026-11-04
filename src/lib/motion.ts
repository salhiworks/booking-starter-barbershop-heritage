export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Bring an element into view (smoothly unless reduced motion) and focus it. */
export function revealAndFocus(element: HTMLElement | null): void {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
