import { addDays, firstDayOfWeek, formatTime, todayInTimeZone } from '@profitstudio/booking-engine';
import { useSoonest } from '../lib/availability';
import { useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import { durationLabel, relativeDay } from '../lib/format';
import { useOpeningStatus } from '../lib/opening';
import { useSiteData } from '../lib/site-data';
import { Arrow } from './Arrow';
import { Picture } from './Picture';
import { StatusLine } from './StatusLine';

/** Keep in step with the hero preload in index.html. */
const HERO_SIZES = '(min-width: 1080px) 42vw, 100vw';

export function Hero() {
  const { values } = useContent();
  const photo = values['hero.photo'];
  return (
    <section className={`hero${photo ? '' : ' hero--no-photo'}`} id="top" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="kicker rise rise--1">{values['hero.kicker']}</p>
          <h1 className="hero__title rise rise--2" id="hero-title">
            {values['hero.title']}
          </h1>
          <p className="hero__lede rise rise--3">{values['hero.lede']}</p>
          <NextChair />
        </div>
        {photo ? (
          <div className="hero__media">
            <div className="frame frame--hero">
              <Picture image={photo} sizes={HERO_SIZES} eager />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** The ruled ticket: soonest open time (from the engine), open-now line and the one Book action. */
function NextChair() {
  const { values } = useContent();
  const { business, services } = useSiteData();
  const { startBooking } = useBookingIntent();

  const biz = business.status === 'ready' ? business.data : null;
  const first = services.status === 'ready' ? (services.data[0] ?? null) : null;
  const bookable = biz?.policies.onlineBookingEnabled ?? false;
  const today = biz ? todayInTimeZone(biz.timezone) : null;
  const lastDay = biz && today ? addDays(today, biz.policies.maxAdvanceDays) : null;
  const soonest = useSoonest(bookable && first ? first.id : null, today, lastDay, firstDayOfWeek(biz?.locale), 0);
  const { status } = useOpeningStatus(biz);

  let body = null;
  if (biz && first && bookable && today) {
    if (soonest.status === 'loading') {
      body = (
        <p className="ticket__time ticket__time--loading">
          <span className="skeleton skeleton--line" aria-hidden="true" />
          <span className="visually-hidden">Checking the next open time…</span>
        </p>
      );
    } else if (soonest.status === 'ready' && soonest.data) {
      const { day, slot } = soonest.data;
      body = (
        <>
          <p className="ticket__time">
            <span className="ticket__part">{relativeDay(day.date, today, biz.locale)}</span>{' '}
            <span className="ticket__sep" aria-hidden="true">
              ·
            </span>
            <span className="visually-hidden">at</span>{' '}
            <span className="ticket__part">{formatTime(slot.startsAt, biz.timezone, biz.locale)}</span>
          </p>
          <p className="ticket__meta">
            for a {first.name} · {durationLabel(first.durationMinutes)}
          </p>
        </>
      );
    } else if (soonest.status === 'ready') {
      body = (
        <>
          <p className="ticket__time ticket__time--quiet">Fully booked for now</p>
          <p className="ticket__meta">Call the shop and ask about the next opening.</p>
        </>
      );
    }
  } else if (biz && !bookable) {
    body = <p className="ticket__time ticket__time--quiet">Booking by phone for now</p>;
  } else if (business.status === 'error' || services.status === 'error') {
    body = <p className="ticket__time ticket__time--quiet">Online booking opens soon</p>;
  }

  return (
    <div className="ticket rise rise--4">
      <div className="ticket__head">
        <p className="ticket__label">{bookable || !biz ? 'Next open chair' : 'Appointments'}</p>
        {status ? <StatusLine status={status} /> : null}
      </div>
      <div className="ticket__body" aria-live="polite">
        {body}
      </div>
      <a
        className="btn btn--primary btn--block btn--large"
        href="#book"
        onClick={(event) => {
          event.preventDefault();
          startBooking();
        }}
      >
        <span>{values['hero.cta']}</span>
        <Arrow />
      </a>
    </div>
  );
}
