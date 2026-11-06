import { OFFLINE_CTA, useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import { Arrow } from './Arrow';
import { Wordmark } from './Wordmark';

/** Sticky, translucent; the Book button is there at every width. */
export function SiteHeader() {
  const { values } = useContent();
  const { startBooking, online } = useBookingIntent();
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <a className="site-header__brand" href="#top" aria-label="Back to the top">
          <Wordmark />
        </a>
        <nav className="site-nav" aria-label="Sections">
          <ul>
            <li>
              <a href="#menu">{values['menu.title']}</a>
            </li>
            <li>
              <a href="#barbers">{values['team.title']}</a>
            </li>
            <li>
              <a href="#shop">{values['shop.title']}</a>
            </li>
            <li>
              <a href="#visit">{values['visit.title']}</a>
            </li>
          </ul>
        </nav>
        <a
          className="btn btn--primary btn--small site-header__cta"
          href="#book"
          onClick={(event) => {
            event.preventDefault();
            startBooking();
          }}
        >
          <span>{online ? 'Book' : OFFLINE_CTA}</span>
          <Arrow />
        </a>
      </div>
    </header>
  );
}
