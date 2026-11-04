import type { FormEvent, ReactNode } from 'react';
import type { DetailField, Details, FieldErrors } from './types';

interface DetailsStepProps {
  details: Details;
  errors: FieldErrors;
  formError: ReactNode;
  requirePhone: boolean;
  busy: boolean;
  timeLabel: string;
  onChange: (patch: Partial<Details>) => void;
  onBlurField: (field: DetailField) => void;
  onSubmit: (focusField: (field: DetailField) => void) => void;
  onBack: () => void;
}

export function DetailsStep({
  details,
  errors,
  formError,
  requirePhone,
  busy,
  timeLabel,
  onChange,
  onBlurField,
  onSubmit,
  onBack,
}: DetailsStepProps) {
  // Each input's id is its field name, so focus can move to the first problem.
  const focusField = (field: DetailField) => document.getElementById(field)?.focus();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    onSubmit(focusField);
  };

  const describedBy = (field: DetailField, hint?: boolean) =>
    [hint ? `${field}-hint` : '', errors[field] ? `${field}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <form className="details" onSubmit={submit} noValidate>
      <div className="field">
        <label className="field__label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={120}
          required
          value={details.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy('name')}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => onBlurField('name')}
        />
        {errors.name ? (
          <p className="field__error" id="name-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="email">
          Email
        </label>
        <p className="field__hint" id="email-hint">
          We’ll send a 6-digit code here to confirm it’s you.
        </p>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={254}
          required
          value={details.email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy('email', true)}
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={() => onBlurField('email')}
        />
        {errors.email ? (
          <p className="field__error" id="email-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="phone">
          Phone{requirePhone ? '' : <span className="field__optional"> (optional)</span>}
        </label>
        <p className="field__hint" id="phone-hint">
          Only used if something changes with your appointment.
        </p>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          enterKeyHint="next"
          maxLength={40}
          required={requirePhone}
          value={details.phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy('phone', true)}
          onChange={(e) => onChange({ phone: e.target.value })}
          onBlur={() => onBlurField('phone')}
        />
        {errors.phone ? (
          <p className="field__error" id="phone-error">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="notes">
          Anything we should know? <span className="field__optional">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          enterKeyHint="done"
          placeholder="Growing out the top, first time here…"
          value={details.notes}
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={describedBy('notes')}
          onChange={(e) => onChange({ notes: e.target.value })}
          onBlur={() => onBlurField('notes')}
        />
        {errors.notes ? (
          <p className="field__error" id="notes-error">
            {errors.notes}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div className="panel-message panel-message--alert" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="details__actions">
        <button type="submit" className="btn btn--primary btn--large" disabled={busy} aria-disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Holding {timeLabel}…
            </>
          ) : __BOOKING_DEMO__ ? (
            'Continue to the code'
          ) : (
            'Email me the code'
          )}
        </button>
        <button type="button" className="text-btn" onClick={onBack} disabled={busy}>
          Change the time
        </button>
      </div>
      <p className="details__small">We hold {timeLabel} for you while you enter the code.</p>
    </form>
  );
}
