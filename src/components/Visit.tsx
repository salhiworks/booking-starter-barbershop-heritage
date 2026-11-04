import { todayInTimeZone, weekdayOf, type Business, type OpeningTimesDay } from '@profitstudio/booking-engine';
import { useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import {
  hoursForWeekday,
  mapsHref,
  rangesLabel,
  shortDate,
  signHours,
  smsHref,
  telHref,
  weekdayName,
  WEEKDAYS,
} from '../lib/format';
import { isSetupError } from '../lib/load';
import { changesAhead, useOpeningStatus } from '../lib/opening';
import { useSiteData } from '../lib/site-data';
import { Arrow } from './Arrow';
import { NorthMark } from './NorthMark';
import { Picture } from './Picture';
import { SectionHead } from './SectionHead';
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
        <div className="visit__media">
          {photo ? (
            <div className="frame frame--portrait">
              <Picture image={photo} sizes="(min-width: 1080px) 560px, 90vw" />
            </div>
          ) : (
            <WindowSign business={biz} fallbackName={values['seo.title'].split(' — ')[0]} />
          )}
        </div>
        <div className="visit__info">
          <SectionHead number="07" label="Find us" title={values['visit.title']} titleId="visit-title" />
          {business.status === 'loading' ? (
            <div className="hours-skeleton" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className="skeleton skeleton--line" />
              ))}
            </div>
          ) : null}
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
            <>
              {status ? <StatusLine status={status} className="status--large" /> : null}
              <HoursBoard business={biz} />
              {days.status === 'ready' ? <ChangesAhead days={days.data} business={biz} /> : null}
              <div className="visit__contact">
                {biz.contact.address ? (
                  <address className="visit__address">{biz.contact.address}</address>
                ) : null}
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
            </>
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

/**
 * The shopfront at dusk, painted rather than photographed: a lit window with
 * gilded lettering (name and hours from the engine). Decorative — the same
 * facts are in the hours table — and replaced by the owner's own shopfront
 * photo when they add one (Website → Hours & directions).
 */
function WindowSign({ business, fallbackName }: { business: Business | null; fallbackName: string }) {
  const name = business?.name ?? fallbackName;
  const split = name.lastIndexOf(' ');
  const main = split > 0 ? name.slice(0, split) : name;
  const trade = split > 0 ? name.slice(split + 1) : '';
  const lines = business ? signHours(business.openingHours, business.locale) : [];
  return (
    <div className="window" aria-hidden="true">
      <div className="window__frame">
        <div className="window__glass">
          <NorthMark className="window__mark" />
          <p className="window__name">{main}</p>
          {trade ? <p className="window__trade">{trade}</p> : null}
          <span className="window__rule" />
          <ul className="window__hours">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="window__sill" />
    </div>
  );
}
