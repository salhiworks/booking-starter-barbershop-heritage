/** The "north line": a hairline rising to a small arrowhead. Decorative. */
export function NorthMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 32" aria-hidden="true" focusable="false">
      <path d="M6 1 L10.5 10 L6 7.6 L1.5 10 Z" fill="currentColor" />
      <rect x="5.4" y="8" width="1.2" height="23" fill="currentColor" />
    </svg>
  );
}
