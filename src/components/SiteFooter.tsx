import { OFFLINE_CTA, useBookingIntent } from '../lib/booking-intent';
import { useContent } from '../lib/content';
import { telHref } from '../lib/format';
import { useSiteData } from '../lib/site-data';
import { Arrow } from './Arrow';
import { Wordmark } from './Wordmark';

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  const { values } = useContent();
  const { business } = useSiteData();
  const { startBooking, online } = useBookingIntent();
  const biz = business.status === 'ready' ? business.data : null;

  return (
    <footer className="site-footer">
      {/* The closing call to action, on the light ground just above the footer. */}
      <div className="closing">
        <div className="wrap closing__inner">
          {/* The headline again, as the sign-off. */}
          <p className="closing__text">{values['hero.title']}</p>
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
        </div>
      </div>
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Wordmark className="wordmark--footer" />
          <p className="site-footer__note">{values['footer.note']}</p>
        </div>
        {biz ? (
          <address className="site-footer__contact">
            {biz.contact.address ? <span>{biz.contact.address}</span> : null}
            {biz.contact.phone ? <a href={telHref(biz.contact.phone)}>{biz.contact.phone}</a> : null}
            {biz.contact.email ? <a href={`mailto:${biz.contact.email}`}>{biz.contact.email}</a> : null}
          </address>
        ) : null}
        <nav className="site-footer__nav" aria-label="Footer">
          <ul>
            <li>
              <a href="#menu">{values['menu.title']}</a>
            </li>
            <li>
              <a href="#book">{values['book.title']}</a>
            </li>
            <li>
              <a href="#visit">{values['visit.title']}</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="wrap site-footer__base">
        <p>
          © {YEAR} {biz?.name ?? ''}
        </p>
        <a className="site-footer__staff" href="/admin/">
          Staff login
        </a>
      </div>
    </footer>
  );
}
