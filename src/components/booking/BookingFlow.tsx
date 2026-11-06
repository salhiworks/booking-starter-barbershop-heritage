import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import {
  addDays,
  firstDayOfWeek,
  formatTime,
  partOfDay,
  todayInTimeZone,
  type Business,
  type PartOfDay,
  type PendingVerification,
  type Service,
} from '@profitstudio/booking-engine';
import { invalidateAvailability } from '../../lib/availability';
import { useBookingIntent } from '../../lib/booking-intent';
import { durationLabel, priceLabel } from '../../lib/format';
import { useContent } from '../../lib/content';
import { engine } from '../../lib/engine';
import { revealAndFocus } from '../../lib/motion';
import { CodeStep } from './CodeStep';
import { ContactCard } from './ContactCard';
import { DetailsStep } from './DetailsStep';
import { DoneStep } from './DoneStep';
import { problemText, serverFieldError, validateDetails } from './messages';
import { ServiceStep } from './ServiceStep';
import { Summary } from './Summary';
import { TimeStep } from './TimeStep';
import {
  STEPS,
  type Blocked,
  type ChosenSlot,
  type DetailField,
  type Details,
  type FieldErrors,
  type Notice,
  type Outcome,
  type Step,
} from './types';

interface State {
  step: Step;
  serviceId: string | null;
  viewDate: string;
  part: PartOfDay | null;
  slot: ChosenSlot | null;
  details: Details;
  /** The held request: in component state only, never stored (INTEGRATION.md §6). */
  pending: PendingVerification | null;
  outcome: Outcome | null;
  notice: Notice | null;
  /** Bumped (after dropping the cache) whenever times must be read again. */
  version: number;
  blocked: Blocked | null;
  /** Bumped when a new step's heading should take focus. */
  focusKey: number;
}

type Action =
  | { type: 'intent'; serviceId: string | null; today: string }
  | { type: 'service'; serviceId: string }
  | { type: 'goto'; step: 'service' | 'time' | 'details' }
  | { type: 'day'; date: string }
  | { type: 'part'; part: PartOfDay }
  | { type: 'slot'; slot: ChosenSlot }
  | { type: 'details'; patch: Partial<Details> }
  | { type: 'requested'; pending: PendingVerification }
  | { type: 'backToTimes'; notice: Notice | null }
  | { type: 'backToDetails' }
  | { type: 'serviceGone'; notice: Notice }
  | { type: 'done'; outcome: Outcome }
  | { type: 'blocked'; blocked: Blocked }
  | { type: 'refresh' }
  | { type: 'restart'; today: string };

const EMPTY_DETAILS: Details = { name: '', email: '', phone: '', notes: '' };
const FIELD_ORDER: DetailField[] = ['name', 'email', 'phone', 'notes'];

function init(today: string): State {
  return {
    step: 'service',
    serviceId: null,
    viewDate: today,
    part: null,
    slot: null,
    details: EMPTY_DETAILS,
    pending: null,
    outcome: null,
    notice: null,
    version: 0,
    blocked: null,
    focusKey: 0,
  };
}

function chooseService(state: State, serviceId: string, focusKey: number): State {
  const same = state.serviceId === serviceId;
  return {
    ...state,
    step: 'time',
    serviceId,
    slot: same ? state.slot : null,
    part: same ? state.part : null,
    pending: null,
    outcome: null,
    notice: null,
    focusKey,
  };
}

function reducer(state: State, action: Action): State {
  const focusKey = state.focusKey + 1;
  switch (action.type) {
    case 'intent':
      // Never interrupt a code that is on its way: just bring the flow into view.
      if (state.step === 'code') return { ...state, focusKey };
      if (action.serviceId) return chooseService(state, action.serviceId, focusKey);
      if (state.step === 'done') return { ...init(action.today), details: state.details, version: state.version + 1, focusKey };
      return { ...state, focusKey };
    case 'service':
      return chooseService(state, action.serviceId, focusKey);
    case 'goto':
      return { ...state, step: action.step, notice: null, focusKey };
    case 'day':
      if (state.viewDate === action.date) return state;
      return {
        ...state,
        viewDate: action.date,
        part: null,
        slot: state.slot && state.slot.date === action.date ? state.slot : null,
      };
    case 'part':
      return { ...state, part: action.part };
    case 'slot':
      return { ...state, slot: action.slot, viewDate: action.slot.date, part: partOfDay(action.slot.time), notice: null };
    case 'details':
      return { ...state, details: { ...state.details, ...action.patch } };
    case 'requested':
      return { ...state, step: 'code', pending: action.pending, notice: null, focusKey };
    case 'backToTimes':
      return { ...state, step: 'time', slot: null, pending: null, notice: action.notice, version: state.version + 1, focusKey };
    case 'backToDetails':
      return { ...state, step: 'details', pending: null, notice: null, version: state.version + 1, focusKey };
    case 'serviceGone':
      return { ...state, step: 'service', serviceId: null, slot: null, pending: null, notice: action.notice, focusKey };
    case 'done':
      return { ...state, step: 'done', outcome: action.outcome, pending: null, notice: null, version: state.version + 1, focusKey };
    case 'blocked':
      return { ...state, blocked: action.blocked, pending: null, focusKey };
    case 'refresh':
      return { ...state, version: state.version + 1 };
    case 'restart':
      return { ...init(action.today), details: state.details, version: state.version + 1, focusKey };
  }
}

interface BookingFlowProps {
  business: Business;
  services: Service[];
  onServicesStale: () => void;
  onBusinessStale: () => void;
}

export function BookingFlow({ business, services, onServicesStale, onBusinessStale }: BookingFlowProps) {
  const { values } = useContent();
  const { intent } = useBookingIntent();
  const { timezone, locale, policies } = business;
  const today = todayInTimeZone(timezone);
  const lastDay = addDays(today, policies.maxAdvanceDays);
  const firstDay = firstDayOfWeek(locale);

  const [state, dispatch] = useReducer(reducer, today, init);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checked, setChecked] = useState(false);
  const [formError, setFormError] = useState<ReactNode>(null);
  const [requesting, setRequesting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const service = services.find((s) => s.id === state.serviceId) ?? null;
  const step: Step = state.step !== 'done' && state.step !== 'service' && !service ? 'service' : state.step;

  // "Book" anywhere on the page: open the flow (with that service chosen).
  const seenNonce = useRef(0);
  useEffect(() => {
    if (!intent || intent.nonce === seenNonce.current) return;
    seenNonce.current = intent.nonce;
    const known = intent.serviceId && services.some((s) => s.id === intent.serviceId) ? intent.serviceId : null;
    dispatch({ type: 'intent', serviceId: known, today: todayInTimeZone(timezone) });
  }, [intent, services, timezone]);

  // Focus moves to each new step's heading (never on the first render).
  // In the booking sheet the step starts at the top (progress and all); elsewhere, scroll to it.
  useEffect(() => {
    if (state.focusKey === 0) return;
    const heading = headingRef.current;
    const sheet = heading?.closest<HTMLElement>('.sheet__body');
    if (sheet && heading) {
      sheet.scrollTo({ top: 0 });
      heading.focus({ preventScroll: true });
    } else revealAndFocus(heading);
  }, [state.focusKey]);

  const onDay = useCallback((date: string) => dispatch({ type: 'day', date }), []);
  const onPart = useCallback((part: PartOfDay) => dispatch({ type: 'part', part }), []);
  const onSlot = useCallback((slot: ChosenSlot) => dispatch({ type: 'slot', slot }), []);

  /** Drop cached times first, then move: the reload must not be served from the cache. */
  const backToTimes = (notice: Notice | null) => {
    invalidateAvailability(state.serviceId ?? undefined);
    dispatch({ type: 'backToTimes', notice });
  };

  const blocked = (kind: Blocked) => {
    dispatch({ type: 'blocked', blocked: kind });
    if (kind === 'disabled') onBusinessStale();
  };

  const updateDetails = (patch: Partial<Details>) => {
    dispatch({ type: 'details', patch });
    if (!checked) return;
    const next = validateDetails({ ...state.details, ...patch }, policies.requirePhone);
    setErrors((current) => {
      const updated = { ...current };
      for (const field of Object.keys(patch) as DetailField[]) {
        // Clear as soon as it is fixed; new problems wait for the blur.
        if (!next[field]) delete updated[field];
      }
      return updated;
    });
  };

  const blurField = (field: DetailField) => {
    if (!checked) return;
    const next = validateDetails(state.details, policies.requirePhone);
    setErrors((current) => ({ ...current, [field]: next[field] }));
  };

  async function submitDetails(focusField: (field: DetailField) => void) {
    if (!service || !state.slot) return;
    const slot = state.slot;
    const found = validateDetails(state.details, policies.requirePhone);
    setChecked(true);
    setErrors(found);
    setFormError(null);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      focusField(first);
      return;
    }

    setRequesting(true);
    const { name, email, phone, notes } = state.details;
    const result = await engine.requestBooking({
      serviceId: service.id,
      startsAt: slot.startsAt, // exactly as getAvailability returned it
      customer: { name: name.trim(), email: email.trim(), phone: phone.trim() || null },
      notes: notes.trim() || null,
    });
    setRequesting(false);
    if (result.ok) {
      dispatch({ type: 'requested', pending: result.data });
      return;
    }

    const e = result.error;
    const timeText = formatTime(slot.startsAt, timezone, locale);
    const taken = () =>
      backToTimes({ tone: 'alert', text: `Someone just took ${timeText}. Here are fresh times — your details are saved.` });
    const gone = () => {
      onServicesStale();
      dispatch({
        type: 'serviceGone',
        notice: { tone: 'alert', text: 'That service can’t be booked online right now. Please choose another.' },
      });
    };
    switch (e.code) {
      case 'INVALID_INPUT': {
        const mapped = serverFieldError(e.field);
        if (mapped) {
          setErrors({ [mapped.field]: mapped.text });
          focusField(mapped.field);
        } else if (e.field === 'startsAt') taken();
        else if (e.field === 'serviceId') gone();
        else setFormError(problemText(e));
        return;
      }
      case 'SLOT_UNAVAILABLE':
        taken();
        return;
      case 'SERVICE_UNAVAILABLE':
        gone();
        return;
      case 'BOOKING_DISABLED':
        blocked('disabled');
        return;
      case 'NOT_CONFIGURED':
        blocked('setup');
        return;
      case 'SCHEMA_MISSING':
      case 'SCHEMA_INCOMPATIBLE':
        blocked('unavailable');
        return;
      case 'RATE_LIMITED':
        setFormError(
          <ContactCard
            business={business}
            title="We can’t take more online requests just now"
            text="Call, text or email the shop and we’ll find you a time."
          />,
        );
        return;
      default:
        setFormError(problemText(e));
    }
  }

  if (state.blocked) {
    const copy: Record<Blocked, [string, string]> = {
      disabled: ['Online booking is paused right now', 'Call or message the shop and we’ll find you a chair.'],
      setup: ['Online booking is not available yet', 'Call or message the shop to book for now.'],
      unavailable: ['Online booking is temporarily unavailable', 'Call or message the shop and we’ll book you in.'],
    };
    const [title, text] = copy[state.blocked];
    return <ContactCard business={business} title={title} text={text} />;
  }

  const index = STEPS.findIndex((s) => s.id === step);
  const meta = index >= 0 ? STEPS[index] : null;
  const stepLabel = meta ? `Step ${index + 1} of ${STEPS.length} · ${meta.name}` : 'Done';
  const timeLabel = state.slot ? formatTime(state.slot.startsAt, timezone, locale) : '';

  let title: string = meta?.title ?? '';
  if (step === 'done' && state.outcome) {
    if (state.outcome.kind === 'preview') title = 'Preview — nothing was saved';
    else if (state.outcome.kind === 'limit') title = 'Let’s sort this out together';
    else title = state.outcome.confirmation.status === 'confirmed' ? values['book.confirmed'] : values['book.pending'];
  }

  let content: ReactNode = null;
  if (step === 'service') {
    content = (
      <ServiceStep
        business={business}
        services={services}
        selectedId={state.serviceId}
        onChoose={(serviceId) => dispatch({ type: 'service', serviceId })}
      />
    );
  } else if (step === 'time' && service) {
    content = (
      <TimeStep
        business={business}
        service={service}
        today={today}
        lastDay={lastDay}
        firstDay={firstDay}
        viewDate={state.viewDate < today ? today : state.viewDate}
        part={state.part}
        slot={state.slot}
        version={state.version}
        onDay={onDay}
        onPart={onPart}
        onSlot={onSlot}
        onRetry={() => {
          invalidateAvailability(service.id);
          dispatch({ type: 'refresh' });
        }}
      />
    );
  } else if (step === 'details' && service && state.slot) {
    content = (
      <DetailsStep
        details={state.details}
        errors={errors}
        formError={formError}
        requirePhone={policies.requirePhone}
        busy={requesting}
        timeLabel={timeLabel}
        onChange={updateDetails}
        onBlurField={blurField}
        onSubmit={(focusField) => void submitDetails(focusField)}
        onBack={() => dispatch({ type: 'goto', step: 'time' })}
      />
    );
  } else if (step === 'details') {
    content = (
      <button type="button" className="btn btn--secondary" onClick={() => dispatch({ type: 'goto', step: 'time' })}>
        Pick a time first
      </button>
    );
  } else if (step === 'code' && state.pending && service) {
    const pending = state.pending;
    const slot = state.slot;
    content = (
      <CodeStep
        key={pending.requestId}
        business={business}
        pending={pending}
        onVerified={(confirmation) => {
          invalidateAvailability(service.id);
          dispatch({ type: 'done', outcome: { kind: 'booked', confirmation, email: pending.email } });
        }}
        onPreview={() => {
          if (slot) dispatch({ type: 'done', outcome: { kind: 'preview', slot, email: pending.email } });
        }}
        onBackToTimes={backToTimes}
        onEditDetails={() => {
          invalidateAvailability(service.id);
          dispatch({ type: 'backToDetails' });
        }}
        onBlocked={blocked}
        onLimit={() => {
          invalidateAvailability(service.id);
          dispatch({ type: 'done', outcome: { kind: 'limit' } });
        }}
      />
    );
  } else if (step === 'done' && state.outcome) {
    content = (
      <DoneStep
        outcome={state.outcome}
        business={business}
        serviceName={service?.name ?? ''}
        pendingText={values['book.pending']}
        confirmedText={values['book.confirmed']}
        onRestart={() => dispatch({ type: 'restart', today: todayInTimeZone(timezone) })}
      />
    );
  }

  const showBar = (step === 'time' || step === 'details' || step === 'code') && service !== null;
  const onContinue = step === 'time' && state.slot ? () => dispatch({ type: 'goto', step: 'details' }) : undefined;
  const pulseKey = `${state.serviceId ?? ''}|${state.slot?.startsAt ?? ''}`;

  return (
    <div className={`flow flow--${step}`} id="book-flow">
      <ol className="progress" aria-label="Booking steps">
        {STEPS.map((s, i) => {
          const done = step === 'done' || (index >= 0 && i < index);
          return (
            <li
              key={s.id}
              className={`progress__item${s.id === step ? ' is-current' : ''}${done ? ' is-done' : ''}`}
              aria-current={s.id === step ? 'step' : undefined}
            >
              <span className="progress__name">{s.name}</span>
            </li>
          );
        })}
      </ol>

      <div className={`flow__step flow__step--${step}`} key={step}>
        <p className="flow__eyebrow">{step === 'done' ? (state.outcome?.kind === 'preview' ? 'Preview' : 'All set') : stepLabel}</p>
        <h3 className="flow__title" ref={headingRef} tabIndex={-1} data-step-heading="">
          {title}
        </h3>
        {(step === 'time' || step === 'details') && service ? (
          <div className="chosen">
            <p className="chosen__text">
              <span className="chosen__name">{service.name}</span>
              <span className="chosen__meta">
                {durationLabel(service.durationMinutes)} · {priceLabel(service, locale)}
              </span>
            </p>
            <button type="button" className="text-btn" onClick={() => dispatch({ type: 'goto', step: 'service' })}>
              Change<span className="visually-hidden"> service</span>
            </button>
          </div>
        ) : null}
        {state.notice ? (
          <p className={`notice notice--${state.notice.tone}`} role={state.notice.tone === 'alert' ? 'alert' : 'status'}>
            {state.notice.text}
          </p>
        ) : null}
        {content}
      </div>

      {showBar ? (
        <Summary business={business} service={service} slot={state.slot} today={today} stepLabel={meta?.name ?? ''} onContinue={onContinue} pulseKey={pulseKey} />
      ) : null}
    </div>
  );
}
