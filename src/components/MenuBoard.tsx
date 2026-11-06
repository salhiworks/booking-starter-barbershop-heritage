import type { Service, ServiceImage } from '@profitstudio/booking-engine';
import { useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import { isSetupError } from '../lib/load';
import { useSiteData } from '../lib/site-data';
import { CutRow } from './CutRow';
import { SectionHead } from './SectionHead';

/**
 * The cut list: every service with its duration, description and price, from
 * the engine. Each row books that service. The owner's optional service photos
 * follow as captioned plates (a swipe row on phones).
 */
export function MenuBoard() {
  const { values } = useContent();
  const { business, services, reloadServices, reloadBusiness } = useSiteData();
  const { startBooking } = useBookingIntent();

  let body = null;
  if (services.status === 'loading' || business.status === 'loading') {
    body = (
      <div className="menu__skeleton" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="skeleton skeleton--board" />
        ))}
      </div>
    );
  } else if (services.status === 'error' || business.status === 'error') {
    const error = services.status === 'error' ? services.error : business.status === 'error' ? business.error : null;
    body = (
      <div className="message" role="status">
        {error && isSetupError(error) ? (
          <p>The menu will appear here as soon as online booking is set up.</p>
        ) : (
          <>
            <p>We couldn’t load the menu just now.</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                if (services.status === 'error') reloadServices();
                if (business.status === 'error') reloadBusiness();
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    );
  } else if (services.data.length === 0) {
    body = (
      <div className="message" role="status">
        <p>The menu is being updated. Call the shop for today’s services and prices.</p>
      </div>
    );
  } else {
    const biz = business.data;
    const onBook = biz.policies.onlineBookingEnabled ? startBooking : undefined;
    body = (
      <>
        <ul className={`cuts cuts--menu${services.data.length > 3 ? ' cuts--columns' : ''}`}>
          {services.data.map((service) => (
            <CutRow key={service.id} service={service} business={biz} onBook={onBook} withDescription />
          ))}
        </ul>
        <p className="menu__currency">Prices in {biz.currency}</p>
        <Plates services={services.data} />
      </>
    );
  }

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="wrap">
        <SectionHead title={values['menu.title']} titleId="menu-title" lede={values['menu.lede']} />
        {body}
      </div>
    </section>
  );
}

function Plates({ services }: { services: Service[] }) {
  const plates = services.filter((s): s is Service & { image: ServiceImage } => Boolean(s.image));
  if (plates.length === 0) return null;
  return (
    <div className="plates">
      <p className="kicker plates__title">From the chair</p>
      {/* Focusable: on phones it is a swipe row that keyboard users can scroll too. */}
      <ul className="plates__list" tabIndex={0} aria-label="Service photos">
        {plates.map((service) => (
          <li className="plate" key={service.id}>
            <figure>
              <div className="frame frame--plate">
                <img
                  src={service.image.url}
                  alt={service.image.alt}
                  width={service.image.width ?? undefined}
                  height={service.image.height ?? undefined}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="plate__caption">{service.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
