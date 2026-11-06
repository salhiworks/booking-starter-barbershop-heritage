import { useRef, useState, type ClipboardEvent, type FormEvent } from 'react';
import {
  formatTime,
  type BookingConfirmation,
  type Business,
  type PendingVerification,
} from '@profitstudio/booking-engine';
import { engine } from '../../lib/engine';
import { useNow } from '../../lib/use-now';
import { problemText } from './messages';
import type { Blocked, Notice } from './types';

interface CodeStepProps {
  business: Business;
  pending: PendingVerification;
  onVerified: (confirmation: BookingConfirmation) => void;
  onPreview: () => void;
  /** The hold is gone (expired, released, taken): back to the times, which reload. */
  onBackToTimes: (notice: Notice | null) => void;
  /** Released on purpose to correct the email address. */
  onEditDetails: () => void;
  onBlocked: (blocked: Blocked) => void;
  onLimit: () => void;
}

/** Keep digits only, at most six — on typing, autofill and paste ("123 456" → "123456"). */
function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

export function CodeStep({ business, pending, onVerified, onPreview, onBackToTimes, onEditDetails, onBlocked, onLimit }: CodeStepProps) {
  const { timezone, locale } = business;
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [leaving, setLeaving] = useState<null | 'time' | 'details'>(null);
  const [resendsLeft, setResendsLeft] = useState(pending.resendsLeft);
  const [resendAt, setResendAt] = useState(() => Date.now() + pending.resendAfterSeconds * 1000);

  const now = useNow(1000);
  const expiresAt = Date.parse(pending.expiresAt);
  const expired = now >= expiresAt;
  const until = formatTime(pending.expiresAt, timezone, locale);
  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const preview = pending.delivery === 'preview';
  const busy = verifying || resending || leaving !== null;

  const backToTimes = (text: string) => onBackToTimes({ tone: 'alert', text });

  async function verify(value: string) {
    if (verifying) return;
    if (value.length !== 6) {
      setError('Enter all 6 digits of the code.');
      inputRef.current?.focus();
      return;
    }
    lastSubmitted.current = value;
    setVerifying(true);
    setError(null);
    const result = await engine.verifyBooking({ requestId: pending.requestId, code: value });
    setVerifying(false);
    if (result.ok) {
      onVerified(result.data);
      return;
    }
    const e = result.error;
    switch (e.code) {
      case 'PREVIEW_MODE':
        onPreview();
        return;
      case 'INVALID_CODE': {
        const left = e.attemptsLeft;
        setError(
          left === undefined
            ? 'That code doesn’t match. Check the latest email and try again.'
            : `That code doesn’t match. ${left} ${left === 1 ? 'try' : 'tries'} left.`,
        );
        inputRef.current?.select();
        return;
      }
      case 'INVALID_INPUT':
        if (e.field === 'requestId') backToTimes('That request has closed. Pick your time again — your details are saved.');
        else setError('Enter all 6 digits of the code.');
        return;
      case 'CODE_EXPIRED':
        backToTimes('Your code ran out of time, so we released the hold. Pick a time again — your details are saved.');
        return;
      case 'TOO_MANY_ATTEMPTS':
        backToTimes('Too many wrong codes, so we released that time. Pick a time again — your details are saved.');
        return;
      case 'SLOT_UNAVAILABLE':
        backToTimes('That time just became unavailable. Here are fresh times — your details are saved.');
        return;
      case 'TOO_MANY_BOOKINGS':
        onLimit();
        return;
      case 'BOOKING_DISABLED':
        onBlocked('disabled');
        return;
      case 'NOT_CONFIGURED':
        onBlocked('setup');
        return;
      case 'SCHEMA_MISSING':
      case 'SCHEMA_INCOMPATIBLE':
        onBlocked('unavailable');
        return;
      case 'RATE_LIMITED':
        setError('Too many tries just now. Wait a moment, or call the shop.');
        return;
      default:
        setError(problemText(e));
    }
  }

  /** The code was already accepted (an earlier answer got lost): verifying again shows the confirmation. */
  function alreadyAccepted() {
    const known = lastSubmitted.current || (code.length === 6 ? code : '');
    if (known) void verify(known);
    else setInfo('Your code was already accepted. Enter it once more to see your confirmation.');
  }

  async function resend() {
    if (busy || wait > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);
    const result = await engine.resendVerificationCode(pending.requestId);
    setResending(false);
    if (result.ok) {
      setResendsLeft(result.data.resendsLeft);
      setResendAt(Date.now() + result.data.resendAfterSeconds * 1000);
      setCode('');
      lastSubmitted.current = '';
      setInfo(
        result.data.delivery === 'preview'
          ? `${__BOOKING_DEMO__ ? 'Demo' : 'Preview'}: no email was sent. Any 6 digits still work.`
          : `New code sent to ${pending.email}. The previous one no longer works.`,
      );
      inputRef.current?.focus();
      return;
    }
    const e = result.error;
    switch (e.code) {
      case 'RESEND_TOO_SOON':
        setResendAt(Date.now() + (e.retryAfterSeconds ?? 30) * 1000);
        return;
      case 'RESEND_LIMIT':
        setResendsLeft(0);
        return;
      case 'RATE_LIMITED':
        setInfo(`We can’t send another code right now. Your current code still works until ${until}.`);
        return;
      case 'CODE_EXPIRED':
        backToTimes('Your code ran out of time, so we released the hold. Pick a time again — your details are saved.');
        return;
      case 'CONFLICT':
        if (e.field === 'already_verified') alreadyAccepted();
        else setError(problemText(e));
        return;
      case 'INVALID_INPUT':
        backToTimes('That request has closed. Pick your time again — your details are saved.');
        return;
      case 'BOOKING_DISABLED':
        onBlocked('disabled');
        return;
      default:
        setError(problemText(e));
    }
  }

  /** Release the hold FIRST, then go back (the reload then includes the released time). */
  async function leave(to: 'time' | 'details') {
    if (busy) return;
    setLeaving(to);
    setError(null);
    const result = await engine.cancelBookingRequest(pending.requestId);
    setLeaving(null);
    if (!result.ok && result.error.code === 'CONFLICT' && result.error.field === 'already_verified') {
      alreadyAccepted();
      return;
    }
    if (!result.ok && result.error.code === 'NETWORK') {
      setError('We couldn’t reach the booking system. Check your connection and try again.');
      return;
    }
    // released: true (now) or false (it had already ended) — fine either way.
    if (to === 'time') onBackToTimes(null);
    else onEditDetails();
  }

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = digitsOnly(event.clipboardData.getData('text'));
    setCode(value);
    setError(null);
    if (value.length === 6) void verify(value);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void verify(code);
  };

  return (
    <form className="code" onSubmit={submit} noValidate>
      <p className="code__sent">
        {preview && __BOOKING_DEMO__ ? (
          // Live Demo build only: the booking is kept, in this browser, for the demo dashboard.
          <>
            <strong>Demo:</strong> no email was sent. Type any 6 digits — your booking stays in this browser and
            appears in the demo dashboard.
          </>
        ) : preview ? (
          <>
            <strong>Preview:</strong> no email was sent. Type any 6 digits to see what happens next.
          </>
        ) : (
          <>
            We sent a 6-digit code to <strong className="code__email">{pending.email}</strong>.
          </>
        )}{' '}
        {expired ? (
          <span className="code__expired">This code has probably expired — choose another time below.</span>
        ) : (
          <>It works until {until}.</>
        )}
      </p>

      <label className="field__label" htmlFor="code">
        Your code
      </label>
      <input
        ref={inputRef}
        id="code"
        name="code"
        className="code__input"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        enterKeyHint="go"
        placeholder="••••••"
        value={code}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'code-error' : 'code-hint'}
        onPaste={onPaste}
        onChange={(event) => {
          const value = digitsOnly(event.target.value);
          setCode(value);
          setError(null);
          if (value.length === 6 && value !== lastSubmitted.current) void verify(value);
        }}
      />
      {error ? (
        <p className="field__error" id="code-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="field__hint" id="code-hint">
          Six digits. Pasting the whole code works too.
        </p>
      )}

      {/* The server decides whether the code still works: a slow device clock must never block a valid code. */}
      <button type="submit" className="btn btn--primary btn--large code__submit" disabled={busy} aria-disabled={busy}>
        {verifying ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Checking…
          </>
        ) : (
          'Confirm my appointment'
        )}
      </button>

      <div className="code__more" aria-live="polite">
        {info ? <p className="code__info">{info}</p> : null}
        {resendsLeft > 0 ? (
          <button type="button" className="text-btn" onClick={resend} disabled={busy || wait > 0}>
            {resending ? (
              <>
                <span className="spinner spinner--small" aria-hidden="true" />
                Sending…
              </>
            ) : wait > 0 ? (
              `Send a new code in ${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, '0')}`
            ) : (
              'Send a new code'
            )}
          </button>
        ) : (
          <p className="code__info">No more new codes can be sent. Your current code still works until {until}.</p>
        )}
        <button type="button" className={`text-btn${expired ? ' text-btn--strong' : ''}`} onClick={() => leave('time')} disabled={busy}>
          {leaving === 'time' ? (
            <>
              <span className="spinner spinner--small" aria-hidden="true" />
              Releasing your time…
            </>
          ) : (
            'Choose another time'
          )}
        </button>
        <button type="button" className="text-btn" onClick={() => leave('details')} disabled={busy}>
          {leaving === 'details' ? (
            <>
              <span className="spinner spinner--small" aria-hidden="true" />
              One moment…
            </>
          ) : (
            'Wrong email? Change it'
          )}
        </button>
      </div>

      {/* No email exists in preview or the Live Demo: nothing to look for in spam. */}
      {preview ? null : <p className="code__spam">Nothing yet? Give it a minute and check your spam or promotions folder.</p>}
    </form>
  );
}
