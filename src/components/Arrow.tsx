/** A drawn arrow for buttons (decorative; the label carries the meaning). */
export function Arrow({ direction = 'right', className = '' }: { direction?: 'right' | 'left' | 'down'; className?: string }) {
  const rotate = direction === 'left' ? 180 : direction === 'down' ? 90 : 0;
  return (
    <svg
      className={`arrow ${className}`}
      viewBox="0 0 20 12"
      aria-hidden="true"
      focusable="false"
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <path d="M0 6h17M12.5 1.2 17.6 6l-5.1 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
