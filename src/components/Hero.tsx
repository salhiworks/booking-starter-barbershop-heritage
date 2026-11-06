import { addDays, firstDayOfWeek, formatTime, todayInTimeZone } from '@profitstudio/booking-engine';
import { useSoonest } from '../lib/availability';
import { OFFLINE_CTA, useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import { durationLabel, relativeDay } from '../lib/format';
import { useOpeningStatus } from '../lib/opening';
import { useSiteData } from '../lib/site-data';
import { Arrow } from './Arrow';
import { Picture } from './Picture';
import { StatusLine } from './StatusLine';

/** Keep in step with the hero preloads in index.html. */
const HERO_SIZES = '(min-width: 1360px) 620px, 46vw';
const HERO_NARROW_SIZES = '100vw';

/**
 * The first screen: the headline, the one Book action with the next open
 * time, and the shop at work beside it (its own taller crop on phones). The
 * services and prices follow directly below, in the menu.
 */
export function Hero() {
  const { values } = useContent();
  const { startBooking, online } = useBookingIntent();
  const photo = values['hero.photo'];
  return (
    <section className={`hero${photo ? '' : ' hero--no-photo'}`} id="top" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="kicker rise">{values['hero.kicker']}</p>
          <h1 className="hero__title rise rise--2" id="hero-title">
            {values['hero.title']}
          </h1>
          <p className="hero__lede rise rise--3">{values['hero.lede']}</p>
          <div className="hero__action rise rise--4">
            <a
              className="btn btn--primary btn--large"
              href="#book"
              onClick={(event) => {
                event.preventDefault();
                startBooking();
              }}
            >
              <span>{online ? values['hero.cta'] : OFFLINE_CTA}</span>
              <Arrow />
            </a>
            <NextChair />
          </div>
          <ServicesLink />
        </div>
        {photo ? (
          <div className="hero__media">
            <div className="frame frame--hero">
              <Picture image={photo} sizes={HERO_SIZES} narrowSizes={HERO_NARROW_SIZES} eager />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** The soonest open time (from the engine) and the open-now line, beside the Book button. */
function NextChair() {
  const { business, services } = useSiteData();
  const biz = business.status === 'ready' ? business.data : null;
  const first = services.status === 'ready' ? (services.data[0] ?? null) : null;
  const bookable = biz?.policies.onlineBookingEnabled ?? false;
  const today = biz ? todayInTimeZone(biz.timezone) : null;
  const lastDay = biz && today ? addDays(today, biz.policies.maxAdvanceDays) : null;
  const soonest = useSoonest(bookable && first ? first.id : null, today, lastDay, firstDayOfWeek(biz?.locale), 0);
  const { status } = useOpeningStatus(biz);

  let time = null;
  let meta = null;
  if (biz && first && bookable && today) {
    if (soonest.status === 'loading') {
      time = (
        <>
          <span className="skeleton skeleton--line" aria-hidden="true" />
          <span className="visually-hidden">Checking the next open time…</span>
        </>
      );
    } else if (soonest.status === 'ready' && soonest.data) {
      const { day, slot } = soonest.data;
      time = (
        <>
          {relativeDay(day.date, today, biz.locale)} <span aria-hidden="true">·</span>
          <span className="visually-hidden">at</span> {formatTime(slot.startsAt, biz.timezone, biz.locale)}
        </>
      );
      meta = `for a ${first.name} · ${durationLabel(first.durationMinutes)}`;
    } else if (soonest.status === 'ready') {
      time = 'Fully booked for now';
      meta = 'Call the shop and ask about the next opening.';
    }
  } else if (biz && !bookable) {
    time = 'Booking by phone for now';
  } else if (business.status === 'error' || services.status === 'error') {
    time = 'Online booking opens soon';
  }

  return (
    <div className="next-chair" aria-live="polite">
      <p className="next-chair__label">{bookable || !biz ? 'Next open chair' : 'Appointments'}</p>
      {time ? <p className="next-chair__time">{time}</p> : null}
      {meta ? <p className="next-chair__meta">{meta}</p> : null}
      {status ? <StatusLine status={status} className="next-chair__status" /> : null}
    </div>
  );
}

/** Straight to the prices: every service there books itself. */
function ServicesLink() {
  const { services } = useSiteData();
  const count = services.status === 'ready' ? services.data.length : 0;
  if (count === 0) return null;
  return (
    <a className="hero__more rise rise--4" href="#menu">
      See all {count} services and prices
      <Arrow direction="down" />
    </a>
  );
}
