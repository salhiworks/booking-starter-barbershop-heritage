import {
  formatDate,
  formatTime,
  isDifferentTimeZone,
  timeZoneLabel,
  type Business,
  type Service,
} from '@profitstudio/booking-engine';
import { durationLabel, priceLabel, relativeDay, shortDate } from '../../lib/format';
import type { ChosenSlot } from './types';

interface SummaryProps {
  variant: 'slip' | 'bar';
  business: Business;
  service: Service | null;
  slot: ChosenSlot | null;
  today: string;
  stepLabel: string;
  /** Present on the time step once a time is chosen. */
  onContinue?: () => void;
  onChangeService?: () => void;
  /** Changes whenever the appointment changes: the slip warms briefly. */
  pulseKey: string;
}

/**
 * The appointment so far — service, duration, price, day, time and zone —
 * beside the times on wide screens (the slip) and as a sticky bar on phones.
 */
export function Summary({ variant, business, service, slot, today, stepLabel, onContinue, onChangeService, pulseKey }: SummaryProps) {
  const { timezone, locale } = business;
  let when: string | null = null;
  if (slot) {
    const relative = relativeDay(slot.date, today, locale);
    when =
      relative === 'Today' || relative === 'Tomorrow'
        ? `${relative}, ${formatDate(slot.date, locale, { month: 'short', day: 'numeric' })}`
        : shortDate(slot.date, locale);
  }
  const time = slot ? formatTime(slot.startsAt, timezone, locale) : null;
  const otherZone = isDifferentTimeZone(timezone);

  if (variant === 'bar') {
    return (
      <div className="bar" key={pulseKey}>
        <div className="bar__text">
          <p className="bar__step">{stepLabel}</p>
          {service ? (
            <p className="bar__service">
              {service.name} · {durationLabel(service.durationMinutes)} · {priceLabel(service, locale)}
            </p>
          ) : null}
          <p className="bar__when">{slot ? `${shortDate(slot.date, locale)} · ${time}` : 'Choose a time'}</p>
        </div>
        {onContinue ? (
          <button type="button" className="btn btn--primary bar__go" onClick={onContinue}>
            Continue
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="slip" key={pulseKey}>
      <div className="slip__head">
        <p className="slip__label">Your appointment</p>
        <p className="slip__step">{stepLabel}</p>
      </div>
      <dl className="slip__rows">
        <div className="slip__row">
          <dt>Service</dt>
          <dd>
            {service ? service.name : <span className="slip__empty">Choose a service</span>}
            {service && onChangeService ? (
              <button type="button" className="text-btn slip__change" onClick={onChangeService}>
                Change<span className="visually-hidden"> service</span>
              </button>
            ) : null}
          </dd>
        </div>
        {service ? (
          <>
            <div className="slip__row">
              <dt>Length</dt>
              <dd>{durationLabel(service.durationMinutes)}</dd>
            </div>
            <div className="slip__row">
              <dt>Price</dt>
              <dd>{priceLabel(service, locale)}</dd>
            </div>
          </>
        ) : null}
        <div className="slip__row slip__row--when">
          <dt>Day</dt>
          <dd>{when ?? <span className="slip__empty">—</span>}</dd>
        </div>
        <div className="slip__row slip__row--when">
          <dt>Time</dt>
          <dd className="slip__time">{time ?? <span className="slip__empty">—</span>}</dd>
        </div>
      </dl>
      {otherZone ? <p className="slip__tz">Times in {timeZoneLabel(timezone, locale)}</p> : null}
      {onContinue ? (
        <button type="button" className="btn btn--primary btn--block btn--large slip__go" onClick={onContinue}>
          Continue
        </button>
      ) : null}
    </div>
  );
}
