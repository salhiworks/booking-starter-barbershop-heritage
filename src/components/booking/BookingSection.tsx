import type { EngineError } from '@profitstudio/booking-engine';
import { useEffect, useRef } from 'react';
import { useBookingIntent } from '../../lib/booking-intent';
import { useContent } from '../../lib/content';
import { revealAndFocus } from '../../lib/motion';
import { useSiteData } from '../../lib/site-data';
import { SectionHead } from '../SectionHead';
import { BookingFlow } from './BookingFlow';
import { ContactCard } from './ContactCard';
import { problemText } from './messages';

export function BookingSection() {
  const { values } = useContent();
  const { business, services, reloadBusiness, reloadServices } = useSiteData();
  const { intent } = useBookingIntent();
  const sectionRef = useRef<HTMLElement>(null);
  const flowShown =
    business.status === 'ready' &&
    business.data.policies.onlineBookingEnabled &&
    services.status === 'ready' &&
    services.data.length > 0;

  // “Book a chair” anywhere on the page: the flow brings itself into view; while
  // it is not shown (loading, paused, nothing to book, a problem), show this
  // section and its message instead of doing nothing.
  const handledNonce = useRef(intent?.nonce ?? 0);
  useEffect(() => {
    if (!intent || intent.nonce === handledNonce.current) return;
    handledNonce.current = intent.nonce;
    if (flowShown) return;
    const heading = sectionRef.current?.querySelector<HTMLElement>('#book-title');
    if (heading && !heading.hasAttribute('tabindex')) heading.tabIndex = -1;
    revealAndFocus(heading ?? sectionRef.current);
  }, [intent, flowShown]);

  let body;
  if (business.status === 'loading' || services.status === 'loading') {
    body = <FlowSkeleton />;
  } else if (business.status === 'error') {
    body = <LoadProblem error={business.error} onRetry={reloadBusiness} />;
  } else if (!business.data.policies.onlineBookingEnabled) {
    body = (
      <ContactCard
        business={business.data}
        title="Online booking is paused right now"
        text="Call or message the shop and we’ll find you a chair."
      />
    );
  } else if (services.status === 'error') {
    body = <LoadProblem error={services.error} onRetry={reloadServices} />;
  } else if (services.data.length === 0) {
    body = (
      <ContactCard
        business={business.data}
        title="Nothing to book online just now"
        text="Call or message the shop and we’ll fit you in."
      />
    );
  } else {
    body = (
      <BookingFlow
        business={business.data}
        services={services.data}
        onServicesStale={reloadServices}
        onBusinessStale={reloadBusiness}
      />
    );
  }

  return (
    <section className="book" id="book" aria-labelledby="book-title" ref={sectionRef}>
      <div className="wrap">
        <SectionHead number="03" label="Book online" title={values['book.title']} titleId="book-title" lede={values['book.lede']} />
        {body}
      </div>
    </section>
  );
}

function LoadProblem({ error, onRetry }: { error: EngineError; onRetry: () => void }) {
  if (error.code === 'NOT_CONFIGURED') {
    return (
      <div className="calm" role="status">
        <p className="calm__title">Online booking is not available yet.</p>
        <p>It’s coming soon. Until then, drop by or check back here.</p>
      </div>
    );
  }
  if (error.code === 'SCHEMA_MISSING' || error.code === 'SCHEMA_INCOMPATIBLE') {
    return (
      <div className="calm" role="status">
        <p className="calm__title">Online booking is temporarily unavailable.</p>
        <p>Please try again a little later.</p>
      </div>
    );
  }
  return (
    <div className="panel-message panel-message--alert" role="alert">
      <p className="panel-message__title">The booking calendar didn’t load</p>
      <p>{problemText(error)}</p>
      <button type="button" className="btn btn--secondary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

function FlowSkeleton() {
  return (
    <div className="flow-grid" aria-busy="true">
      <div className="flow">
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
    </div>
  );
}
