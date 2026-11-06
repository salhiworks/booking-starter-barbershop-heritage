import type { Business, Service } from '@profitstudio/booking-engine';
import { durationLabel, priceLabel } from '../lib/format';

interface CutRowProps {
  service: Service;
  business: Business;
  /** Show the owner's description under the name (the full menu does). */
  withDescription?: boolean;
  /** Present while online booking is on: the whole row books this service. */
  onBook?: (serviceId: string) => void;
}

/**
 * One line of the cut list: name, duration, price — and, when booking is on,
 * the whole row is the Book button for that service.
 */
export function CutRow({ service, business, withDescription = false, onBook }: CutRowProps) {
  const price = priceLabel(service, business.locale);
  const duration = durationLabel(service.durationMinutes);
  const body = (
    <>
      <span className="cut__name">{service.name}</span>
      <span className="cut__meta">{duration}</span>
      {withDescription && service.description ? <span className="cut__desc">{service.description}</span> : null}
      <span className="cut__price">
        {price}
        {onBook ? (
          <span className="cut__go" aria-hidden="true">
            <svg viewBox="0 0 20 12" focusable="false">
              <path d="M0 6h17M12.5 1.2 17.6 6l-5.1 4.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
        ) : null}
      </span>
    </>
  );
  return (
    <li className="cut">
      {onBook ? (
        <button
          type="button"
          className="cut__row"
          aria-label={`Book ${service.name}, ${duration}, ${price}`}
          onClick={() => onBook(service.id)}
        >
          {body}
        </button>
      ) : (
        <div className="cut__row">{body}</div>
      )}
    </li>
  );
}
