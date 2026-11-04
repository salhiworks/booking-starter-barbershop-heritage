import type { Business, Service, ServiceImage } from '@profitstudio/booking-engine';
import { useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import { durationLabel, menuNumber, priceLabel } from '../lib/format';
import { isSetupError } from '../lib/load';
import { useSiteData } from '../lib/site-data';
import { SectionHead } from './SectionHead';

/**
 * The menu as a board on the wall: numbered rows, leader dots, prices.
 * Services, durations and prices are the engine's; the owner's optional service
 * photos become captioned plates under the board, numbered to match it.
 */
export function MenuBoard() {
  const { values } = useContent();
  const { business, services, reloadServices, reloadBusiness } = useSiteData();

  let board = null;
  if (services.status === 'loading' || business.status === 'loading') {
    board = <BoardSkeleton />;
  } else if (services.status === 'error' || business.status === 'error') {
    const error = services.status === 'error' ? services.error : business.status === 'error' ? business.error : null;
    board = (
      <div className="board__message" role="status">
        {error && isSetupError(error) ? (
          <p>The menu will appear here as soon as online booking is set up.</p>
        ) : (
          <>
            <p>We couldn’t load the menu just now.</p>
            <button
              type="button"
              className="btn btn--on-dark"
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
    board = (
      <div className="board__message" role="status">
        <p>The menu is being updated. Call the shop for today’s services and prices.</p>
      </div>
    );
  } else {
    board = <BoardList services={services.data} business={business.data} />;
  }

  return (
    <section className="board" id="menu" aria-labelledby="menu-title">
      <div className="board__frame">
        <div className="wrap">
          <SectionHead
            className="section-head--on-dark"
            number="02"
            label="Prices & times"
            title={values['menu.title']}
            titleId="menu-title"
            lede={values['menu.lede']}
          />
          {board}
        </div>
      </div>
    </section>
  );
}

function BoardList({ services, business }: { services: Service[]; business: Business }) {
  const { startBooking } = useBookingIntent();
  const plates = services
    .map((service, index) => ({ service, index }))
    .filter((entry): entry is { service: Service & { image: ServiceImage }; index: number } => Boolean(entry.service.image));

  return (
    <>
      <div className="board__legend" aria-hidden="true">
        <span>No.</span>
        <span>Service</span>
        <span>Prices in {business.currency}</span>
      </div>
      <ol className={`board__list${services.length > 3 ? ' board__list--columns' : ''}`}>
        {services.map((service, index) => (
          <li className="board__item" key={service.id}>
            <span className="board__no" aria-hidden="true">
              {menuNumber(index)}
            </span>
            <div className="board__main">
              <div className="board__line">
                <h3 className="board__name">{service.name}</h3>
                <span className="board__leader" aria-hidden="true" />
                <p className="board__price">{priceLabel(service, business.locale)}</p>
              </div>
              <div className="board__meta">
                <p className="board__duration">{durationLabel(service.durationMinutes)}</p>
                {business.policies.onlineBookingEnabled ? (
                  <button
                    type="button"
                    className="board__book"
                    aria-label={`Book ${service.name}`}
                    onClick={() => startBooking(service.id)}
                  >
                    Book
                  </button>
                ) : null}
              </div>
              {service.description ? <p className="board__desc">{service.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      {plates.length > 0 ? (
        <div className="plates">
          <p className="plates__title">
            <span className="eyebrow__rule" aria-hidden="true" />
            From the chair
          </p>
          {/* Focusable: on phones it is a swipe row that keyboard users can scroll too. */}
          <ul className="plates__list" tabIndex={0} aria-label="Service photos">
            {plates.map(({ service, index }) => (
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
                  <figcaption className="plate__caption">
                    <span className="plate__no">No. {menuNumber(index)}</span>
                    <span className="plate__name">{service.name}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function BoardSkeleton() {
  return (
    <div className="board__skeleton" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="skeleton skeleton--board" />
      ))}
    </div>
  );
}
