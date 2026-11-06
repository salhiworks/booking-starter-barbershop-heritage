import { formatDate, formatTime, type Business, type Service } from '@profitstudio/booking-engine';
import { durationLabel, priceLabel, relativeDay, shortDate } from '../../lib/format';
import type { ChosenSlot } from './types';

interface SummaryProps {
  business: Business;
  service: Service | null;
  slot: ChosenSlot | null;
  today: string;
  stepLabel: string;
  /** Present on the time step once a time is chosen. */
  onContinue?: () => void;
  /** Changes whenever the appointment changes: the bar flashes briefly. */
  pulseKey: string;
}

/**
 * The appointment so far — service, price, day and time — pinned to the
 * bottom of the booking sheet, with Continue once a time is chosen.
 */
export function Summary({ business, service, slot, today, stepLabel, onContinue, pulseKey }: SummaryProps) {
  const { timezone, locale } = business;
  let when: string | null = null;
  if (slot) {
    const relative = relativeDay(slot.date, today, locale);
    const day =
      relative === 'Today' || relative === 'Tomorrow'
        ? `${relative}, ${formatDate(slot.date, locale, { month: 'short', day: 'numeric' })}`
        : shortDate(slot.date, locale);
    when = `${day} · ${formatTime(slot.startsAt, timezone, locale)}`;
  }

  return (
    <div className="bar" key={pulseKey}>
      <div className="bar__text">
        <p className="bar__step">{stepLabel}</p>
        {service ? (
          <p className="bar__service">
            {service.name} · {priceLabel(service, locale)}
          </p>
        ) : null}
        <p className="bar__when">{when ?? (service ? `${durationLabel(service.durationMinutes)} · choose a time` : 'Choose a time')}</p>
      </div>
      {onContinue ? (
        <button type="button" className="btn btn--primary bar__go" onClick={onContinue}>
          Continue
        </button>
      ) : null}
    </div>
  );
}
