import type { Business } from '@profitstudio/booking-engine';
import { smsHref, telHref } from '../../lib/format';

/** Call, text or email the shop — shown instead of the flow when booking online is not possible. */
export function ContactCard({ business, title, text }: { business: Business | null; title: string; text: string }) {
  const contact = business?.contact;
  return (
    <div className="contact-card" role="status">
      <p className="contact-card__title">{title}</p>
      <p className="contact-card__text">{text}</p>
      {contact && (contact.phone || contact.email) ? (
        <>
          <ul className="contact-card__links">
            {contact.phone ? (
              <li>
                <a className="btn btn--primary" href={telHref(contact.phone)}>
                  Call {contact.phone}
                </a>
              </li>
            ) : null}
            {contact.phone ? (
              <li>
                <a className="btn btn--secondary" href={smsHref(contact.phone)}>
                  Send a text
                </a>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <a className="btn btn--secondary" href={`mailto:${contact.email}`}>
                  Email us
                </a>
              </li>
            ) : null}
          </ul>
          {contact.email ? (
            <p className="contact-card__email">
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
