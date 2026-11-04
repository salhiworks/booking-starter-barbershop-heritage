import type { OpeningStatus } from '../lib/opening';

export function StatusLine({ status, className = '' }: { status: OpeningStatus; className?: string }) {
  return (
    <p className={`status ${status.open ? 'status--open' : 'status--closed'} ${className}`}>
      <span className="status__dot" aria-hidden="true" />
      {status.text}
    </p>
  );
}
