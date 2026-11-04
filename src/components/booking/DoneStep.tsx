import { formatDateTime, formatTime, type Business } from '@profitstudio/booking-engine';
import { longDate } from '../../lib/format';
import { ContactCard } from './ContactCard';
import type { Outcome } from './types';

interface DoneStepProps {
  outcome: Outcome;
  business: Business;
  serviceName: string;
  pendingText: string;
  confirmedText: string;
  onRestart: () => void;
}

export function DoneStep({ outcome, business, serviceName, pendingText, confirmedText, onRestart }: DoneStepProps) {
  const { timezone, locale } = business;

  if (outcome.kind === 'limit') {
    return (
      <div className="done">
        <ContactCard
          business={business}
          title="You already have the most appointments we can take online"
          text="This email address has the maximum number of upcoming appointments. Call, text or email the shop and we’ll sort it out."
        />
        <button type="button" className="text-btn" onClick={onRestart}>
          Back to the start
        </button>
      </div>
    );
  }

  if (outcome.kind === 'preview') {
    // Never a success screen: preview saves nothing and sends nothing.
    const live = business.policies.autoConfirm ? confirmedText : pendingText;
    return (
      <div className="done done--preview">
        <p className="done__lead">
          Everything up to here works like the live site, but preview mode stores no appointment and sends no email.
        </p>
        <Ticket
          caption="Not saved"
          rows={[
            ['Service', serviceName],
            ['Day', longDate(outcome.slot.date, locale)],
            ['Time', formatTime(outcome.slot.startsAt, timezone, locale)],
          ]}
        />
        <p className="done__note">
          Once the shop is connected, clients see: <q>{live}</q>
        </p>
        <button type="button" className="btn btn--secondary" onClick={onRestart}>
          Start over
        </button>
      </div>
    );
  }

  const c = outcome.confirmation;
  const confirmed = c.status === 'confirmed';
  return (
    <div className={`done ${confirmed ? 'done--confirmed' : 'done--pending'}`}>
      <p className="done__lead">
        {__BOOKING_DEMO__ ? (
          // Live Demo build only: no email exists to promise.
          <>
            This is a demo, so no email is sent.{' '}
            {confirmed ? 'Your booking is in the demo dashboard.' : 'Your request is waiting in the demo dashboard — confirm it there as the shop owner.'}{' '}
            <a href="/admin/#bookings">Open the demo dashboard</a>
          </>
        ) : confirmed ? (
          `A confirmation is on its way to ${outcome.email}.`
        ) : (
          `We’ve emailed ${outcome.email}. You’ll get another email as soon as the shop confirms.`
        )}
      </p>
      <Ticket
        caption={confirmed ? 'Booked' : 'Requested'}
        rows={[
          ['Service', c.serviceName],
          ['Day', longDate(c.date, locale)],
          ['Time', formatTime(c.startsAt, c.timezone, locale)],
          ['Reference', c.reference],
        ]}
      />
      {!confirmed && c.holdExpiresAt ? (
        <p className="done__note">
          Your time is held for you until {formatDateTime(c.holdExpiresAt, timezone, locale, { weekday: 'short', hour: 'numeric', minute: '2-digit' })} while we confirm.
        </p>
      ) : null}
      <p className="done__note">Need to change something? Call or email the shop and mention your reference.</p>
      <button type="button" className="text-btn" onClick={onRestart}>
        Book another appointment
      </button>
    </div>
  );
}

function Ticket({ caption, rows }: { caption: string; rows: Array<[string, string]> }) {
  return (
    <div className="done-ticket">
      <p className="done-ticket__caption">{caption}</p>
      <dl>
        {rows.map(([label, value]) => (
          <div className="done-ticket__row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
