import { todayInTimeZone, weekdayOf, type Business, type OpeningTimesDay } from '@profitstudio/booking-engine';
import { useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import {
  hoursForWeekday,
  mapsHref,
  rangesLabel,
  shortDate,
  smsHref,
  telHref,
  weekdayName,
  WEEKDAYS,
} from '../lib/format';
import { engine } from '../lib/engine';
import { isSetupError } from '../lib/load';
import { changesAhead, useOpeningStatus } from '../lib/opening';
import { useSiteData } from '../lib/site-data';
import { Arrow } from './Arrow';
import { Picture } from './Picture';
import { StatusLine } from './StatusLine';

export function Visit() {
  const { values } = useContent();
  const { business, reloadBusiness } = useSiteData();
  const { startBooking } = useBookingIntent();
  const biz = business.status === 'ready' ? business.data : null;
  const { days, status } = useOpeningStatus(biz);
  const photo = values['visit.photo'];

  return (
    <section className="visit" id="visit" aria-labelledby="visit-title">
      <div className="wrap visit__grid">
        <div className="visit__info">
          <p className="kicker">Find us</p>
          <h2 className="section-title visit__title" id="visit-title">
            {values['visit.title']}
          </h2>
          {business.status === 'error' ? (
            <div className="message" role="status">
              {isSetupError(business.error) ? (
                <p>Opening hours and directions will appear here soon.</p>
              ) : (
                <>
                  <p>We couldn’t load our hours just now.</p>
                  <button type="button" className="btn btn--secondary" onClick={reloadBusiness}>
                    Try again
                  </button>
                </>
              )}
            </div>
          ) : null}
          {biz ? (
            <div className="visit__contact">
              {biz.contact.address ? <address className="visit__address">{biz.contact.address}</address> : null}
              {/* The Live Demo and preview mode show a fictional shop: say so where people would act on it. */}
              {__BOOKING_DEMO__ || engine.mode === 'preview' ? (
                <p className="tag">Sample details · this shop is fictional, so the address and phone are placeholders</p>
              ) : null}
              {status ? <StatusLine status={status} className="status--large" /> : null}
              <p className="visit__directions">{values['visit.directions']}</p>
              <div className="visit__actions">
                {biz.contact.address ? (
                  <a className="btn btn--secondary" href={mapsHref(biz.contact.address)} target="_blank" rel="noopener noreferrer">
                    <span>Get directions</span>
                    <span className="visually-hidden"> (opens in a new tab)</span>
                    <Arrow />
                  </a>
                ) : null}
                {biz.policies.onlineBookingEnabled ? (
                  <a
                    className="btn btn--primary"
                    href="#book"
                    onClick={(event) => {
                      event.preventDefault();
                      startBooking();
                    }}
                  >
                    {values['hero.cta']}
                  </a>
                ) : null}
              </div>
              <ul className="visit__links">
                {biz.contact.phone ? (
                  <li>
                    <a href={telHref(biz.contact.phone)}>Call {biz.contact.phone}</a>
                  </li>
                ) : null}
                {biz.contact.phone ? (
                  <li>
                    <a href={smsHref(biz.contact.phone)}>Send a text</a>
                  </li>
                ) : null}
                {biz.contact.email ? (
                  <li>
                    <a href={`mailto:${biz.contact.email}`}>{biz.contact.email}</a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="visit__side">
          {business.status === 'loading' ? (
            <div className="hours-skeleton" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className="skeleton skeleton--line" />
              ))}
            </div>
          ) : null}
          {biz ? <HoursBoard business={biz} /> : null}
          {biz && days.status === 'ready' ? <ChangesAhead days={days.data} business={biz} /> : null}
          {photo ? (
            <div className="frame frame--portrait visit__photo">
              <Picture image={photo} sizes="(min-width: 1000px) 520px, 92vw" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** The weekly hours from the engine, Monday to Sunday, today marked. */
function HoursBoard({ business }: { business: Business }) {
  const todayWeekday = weekdayOf(todayInTimeZone(business.timezone));
  return (
    <table className="hours">
      <caption className="visually-hidden">Opening hours</caption>
      <tbody>
        {WEEKDAYS.map((weekday) => {
          const ranges = hoursForWeekday(business.openingHours, weekday);
          const isToday = weekday === todayWeekday;
          return (
            <tr key={weekday} className={`hours__row${isToday ? ' is-today' : ''}${ranges.length ? '' : ' is-closed'}`}>
              <th scope="row" className="hours__day">
                {weekdayName(weekday, business.locale)}
                {isToday ? <span className="hours__today">Today</span> : null}
              </th>
              <td className="hours__time">{ranges.length ? rangesLabel(ranges, business.locale) : 'Closed'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Closures and short days in the next two weeks (getOpeningTimes vs the weekly pattern). */
function ChangesAhead({ days, business }: { days: OpeningTimesDay[]; business: Business }) {
  const changes = changesAhead(days, business);
  if (changes.length === 0) return null;
  return (
    <div className="changes">
      <p className="changes__title">Coming up</p>
      <ul>
        {changes.map((day) => (
          <li key={day.date}>
            <span className="changes__date">{shortDate(day.date, business.locale)}</span>
            <span>{day.hours.length ? rangesLabel(day.hours, business.locale) : 'Closed'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
