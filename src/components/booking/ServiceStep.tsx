import type { Business, Service } from '@profitstudio/booking-engine';
import { durationLabel, menuNumber, priceLabel } from '../../lib/format';

interface ServiceStepProps {
  business: Business;
  services: Service[];
  selectedId: string | null;
  onChoose: (serviceId: string) => void;
}

/** Service first: one tap chooses it and opens the times. */
export function ServiceStep({ business, services, selectedId, onChoose }: ServiceStepProps) {
  return (
    <ul className="choices">
      {services.map((service, index) => {
        const chosen = service.id === selectedId;
        return (
          <li key={service.id}>
            <button type="button" className={`choice${chosen ? ' is-chosen' : ''}`} aria-pressed={chosen} onClick={() => onChoose(service.id)}>
              <span className="choice__no" aria-hidden="true">
                {menuNumber(index)}
              </span>
              <span className="choice__main">
                <span className="choice__name">{service.name}</span>
                <span className="choice__meta">
                  {durationLabel(service.durationMinutes)} · {priceLabel(service, business.locale)}
                </span>
              </span>
              <svg className="choice__go" viewBox="0 0 20 12" aria-hidden="true" focusable="false">
                <path d="M0 6h17M12.5 1.2 17.6 6l-5.1 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
