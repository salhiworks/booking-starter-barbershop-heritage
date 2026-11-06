import type { EngineError } from '@profitstudio/booking-engine';
import { useBookingIntent } from '../../lib/booking-intent';
import { useContent } from '../../lib/content';
import { useSiteData } from '../../lib/site-data';
import { Arrow } from '../Arrow';
import { SectionHead } from '../SectionHead';
import { ContactCard } from './ContactCard';
import { problemText } from './messages';

/**
 * #book on the page: how booking works and the button that opens the booking
 * sheet — or, while online booking is not possible, why, with the shop's
 * contact details. Every Book button lands here in that case.
 */
export function BookingSection() {
  const { values } = useContent();
  const { business, services, reloadBusiness, reloadServices } = useSiteData();
  const { startBooking } = useBookingIntent();

  let body;
  if (business.status === 'loading' || services.status === 'loading') {
    body = (
      <div className="book__skeleton" aria-hidden="true">
        <span className="skeleton skeleton--board" />
        <span className="skeleton skeleton--board" />
        <span className="skeleton skeleton--board" />
      </div>
    );
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
      <div className="book__how">
        <ol className="book__steps">
          <li>
            <span className="book__no" aria-hidden="true">
              1
            </span>
            <span className="book__step">Pick a service</span>
            <span className="book__text">From the list, or straight from any Book button.</span>
          </li>
          <li>
            <span className="book__no" aria-hidden="true">
              2
            </span>
            <span className="book__step">Pick a day and time</span>
            <span className="book__text">Two weeks at a glance, times grouped by part of the day.</span>
          </li>
          <li>
            <span className="book__no" aria-hidden="true">
              3
            </span>
            <span className="book__step">Confirm with a code</span>
            <span className="book__text">
              {__BOOKING_DEMO__
                ? 'In this demo no email is sent: any 6 digits confirm it.'
                : 'We email you a 6-digit code to confirm it’s you.'}
            </span>
          </li>
        </ol>
        <button type="button" className="btn btn--primary btn--large" onClick={() => startBooking()}>
          <span>{values['hero.cta']}</span>
          <Arrow />
        </button>
      </div>
    );
  }

  return (
    <section className="book" id="book" aria-labelledby="book-title">
      <div className="wrap book__grid">
        <SectionHead title={values['book.title']} titleId="book-title" lede={values['book.lede']} />
        <div className="book__body" data-booking-body="">
          {body}
        </div>
      </div>
    </section>
  );
}

export function LoadProblem({ error, onRetry }: { error: EngineError; onRetry: () => void }) {
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
