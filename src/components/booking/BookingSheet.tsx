import { useEffect, useRef, type MouseEvent } from 'react';
import { useContent } from '../../lib/content';
import { useModalDialog } from '../../lib/dialog';
import { useSiteData } from '../../lib/site-data';
import { BookingFlow } from './BookingFlow';
import { LoadProblem } from './BookingSection';
import { ContactCard } from './ContactCard';

/**
 * The booking as a focused sheet over the page (a modal <dialog> at #book):
 * full height on phones, a panel on the right from 900px. Opened by every
 * Book action; closed with ✕, Esc, Back or a click beside the panel. The flow
 * stays mounted while closed, so every choice — a held time included — is
 * still there when it opens again.
 */
export function BookingSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { values } = useContent();
  const ref = useRef<HTMLDialogElement>(null);
  useModalDialog(ref, open, onClose);

  // Opening: the current step's heading takes focus (INTEGRATION.md §8).
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const dialog = ref.current;
      const target = dialog?.querySelector<HTMLElement>('[data-step-heading]') ?? dialog?.querySelector<HTMLElement>('[data-sheet-title]');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // A click on the dimmed page beside the panel (the dialog itself) closes it.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-title" onClick={onDialogClick}>
      <div className="sheet__panel">
        <header className="sheet__head">
          <p className="sheet__title" id="sheet-title" tabIndex={-1} data-sheet-title="">
            {values['book.title']}
          </p>
          <button type="button" className="icon-btn sheet__close" onClick={onClose}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M3 3l10 10M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="visually-hidden">Close the booking</span>
          </button>
        </header>
        <div className="sheet__body">
          <SheetSurface />
        </div>
      </div>
    </dialog>
  );
}

/** The flow, or why there is none yet (loading, paused, nothing to book, a problem). */
function SheetSurface() {
  const { business, services, reloadBusiness, reloadServices } = useSiteData();
  if (business.status === 'ready' && services.status === 'ready' && business.data.policies.onlineBookingEnabled && services.data.length > 0) {
    return (
      <BookingFlow
        business={business.data}
        services={services.data}
        onServicesStale={reloadServices}
        onBusinessStale={reloadBusiness}
      />
    );
  }
  if (business.status === 'loading' || services.status === 'loading') {
    return (
      <div className="sheet__message" aria-busy="true">
        <p className="visually-hidden" role="status">
          Loading the booking calendar…
        </p>
        <div className="flow-skeleton" aria-hidden="true">
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--title" />
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="skeleton skeleton--choice" />
          ))}
        </div>
      </div>
    );
  }
  let body;
  if (business.status === 'error') body = <LoadProblem error={business.error} onRetry={reloadBusiness} />;
  else if (services.status === 'error') body = <LoadProblem error={services.error} onRetry={reloadServices} />;
  else if (business.status === 'ready' && !business.data.policies.onlineBookingEnabled)
    body = <ContactCard business={business.data} title="Online booking is paused right now" text="Call or message the shop and we’ll find you a chair." />;
  else
    body = (
      <ContactCard
        business={business.status === 'ready' ? business.data : null}
        title="Nothing to book online just now"
        text="Call or message the shop and we’ll fit you in."
      />
    );
  return <div className="sheet__message">{body}</div>;
}
