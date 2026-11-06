import { useEffect, useRef, useState } from 'react';
import {
  addDays,
  formatTime,
  groupSlotsByPartOfDay,
  isDifferentTimeZone,
  isFewLeft,
  monthOf,
  nextAvailableDay,
  partOfDay,
  timeZoneLabel,
  type AvailabilityDay,
  type Business,
  type PartOfDay,
  type Service,
  type Weekday,
} from '@profitstudio/booking-engine';
import { useMonthDays, useSoonest } from '../../lib/availability';
import { longDate, relativeDay } from '../../lib/format';
import type { Load } from '../../lib/load';
import { MonthCalendar, WeekStrip } from './Calendar';
import { problemText } from './messages';
import type { ChosenSlot } from './types';

const PART_NAMES: Record<PartOfDay, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

/** The strip shows two weeks, starting today: no past days, no calendar-week cut-off. */
const STRIP_DAYS = 14;
/** Up to this many times on a day, every part of the day is listed at once; above it, tabs. */
const STACK_LIMIT = 18;

/** Whole days from `from` to `to` (both YYYY-MM-DD calendar dates, no time zone involved). */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Two loads of server days (one per month grid) read as one; the calendar only reshapes them. */
function mergeDays(a: Load<AvailabilityDay[]>, b: Load<AvailabilityDay[]>): Load<AvailabilityDay[]> {
  if (a.status === 'error') return a;
  if (b.status === 'error') return b;
  if (a.status !== 'ready' || b.status !== 'ready') return a.status !== 'ready' ? a : b;
  if (a.data === b.data) return a;
  const known = new Set(a.data.map((d) => d.date));
  return { status: 'ready', data: [...a.data, ...b.data.filter((d) => !known.has(d.date))] };
}

interface TimeStepProps {
  business: Business;
  service: Service;
  today: string;
  lastDay: string;
  firstDay: Weekday;
  viewDate: string;
  part: PartOfDay | null;
  slot: ChosenSlot | null;
  version: number;
  onDay: (date: string) => void;
  onPart: (part: PartOfDay) => void;
  onSlot: (slot: ChosenSlot) => void;
  onRetry: () => void;
}

export function TimeStep(props: TimeStepProps) {
  const { business, service, today, lastDay, firstDay, viewDate, slot, version, onDay } = props;
  const { timezone, locale } = business;
  const [monthOpen, setMonthOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => monthOf(viewDate));

  // The two-week window holding the day in view (a day picked in the month view moves it).
  const offset = Math.max(0, daysBetween(today, viewDate));
  const stripStart = addDays(today, Math.floor(offset / STRIP_DAYS) * STRIP_DAYS);
  const stripDates = Array.from({ length: STRIP_DAYS }, (_, i) => addDays(stripStart, i));
  const stripEnd = stripDates[STRIP_DAYS - 1];
  const first = useMonthDays(service.id, monthOpen ? viewMonth : monthOf(stripStart), firstDay, version);
  const second = useMonthDays(service.id, monthOf(stripEnd), firstDay, version);
  const days = monthOpen ? first : mergeDays(first, second);
  const soonest = useSoonest(service.id, today, lastDay, firstDay, version);
  const loadedDays = days.status === 'ready' ? days.data : null;

  // After moving to the next or previous two weeks, land on their first open day once its times are in.
  const autoPick = useRef(false);
  useEffect(() => {
    if (!autoPick.current || !loadedDays) return;
    autoPick.current = false;
    const open = loadedDays.find((d) => stripDates.includes(d.date) && d.status === 'available' && d.date >= today);
    if (open && open.date !== viewDate) onDay(open.date);
  });

  // Keyboard focus follows the calendar: into the month when it opens, back to the
  // week (the chosen day, or the Month button) when it closes.
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<null | 'month' | 'day' | 'toggle'>(null);
  useEffect(() => {
    const target = pendingFocus.current;
    const root = rootRef.current;
    if (!target || !root) return;
    const selector =
      target === 'month'
        ? '.month .day[tabindex="0"]'
        : target === 'day'
          ? `.strip__days [data-date="${viewDate}"]`
          : '.strip__toggle';
    const element = root.querySelector<HTMLElement>(selector);
    if (element) {
      pendingFocus.current = null;
      element.focus();
    }
  });

  const canPrevWeek = stripStart > today;
  const canNextWeek = addDays(stripStart, STRIP_DAYS) <= lastDay;
  const goWeek = (delta: number) => {
    const target = addDays(stripStart, delta * STRIP_DAYS);
    autoPick.current = true;
    onDay(target < today ? today : target);
  };

  const soonestReady = soonest.status === 'ready' ? soonest.data : null;
  const soonestChosen = Boolean(soonestReady && slot?.startsAt === soonestReady.slot.startsAt);

  return (
    <div className="timestep" ref={rootRef}>
      <div className="timestep__top">
        {soonest.status === 'loading' ? (
          <span className="next-open next-open--loading" aria-hidden="true">
            <span className="skeleton skeleton--chip" />
          </span>
        ) : null}
        {soonestReady ? (
          <button
            type="button"
            className={`next-open${soonestChosen ? ' is-chosen' : ''}`}
            aria-pressed={soonestChosen}
            onClick={() => {
              setMonthOpen(false);
              props.onSlot({ date: soonestReady.day.date, ...soonestReady.slot });
            }}
          >
            <span className="next-open__label">Next open</span>
            <span className="next-open__time">
              {relativeDay(soonestReady.day.date, today, locale)} · {formatTime(soonestReady.slot.startsAt, timezone, locale)}
            </span>
          </button>
        ) : null}
        {soonest.status === 'ready' && !soonestReady ? (
          <p className="timestep__none">No online times left in the next {business.policies.maxAdvanceDays} days.</p>
        ) : null}
        {isDifferentTimeZone(timezone) ? (
          <p className="timestep__tz">Times shown in {timeZoneLabel(timezone, locale)}</p>
        ) : null}
      </div>

      {monthOpen ? (
        <div className="timestep__month">
          <MonthCalendar
            month={viewMonth}
            firstDay={firstDay}
            today={today}
            lastDay={lastDay}
            locale={locale}
            days={loadedDays}
            selected={viewDate}
            onMonth={setViewMonth}
            onSelect={(date) => {
              pendingFocus.current = 'day';
              onDay(date);
              setMonthOpen(false);
            }}
          />
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              pendingFocus.current = 'toggle';
              setMonthOpen(false);
            }}
          >
            Back to the week
          </button>
        </div>
      ) : (
        <WeekStrip
          dates={stripDates}
          today={today}
          lastDay={lastDay}
          locale={locale}
          days={loadedDays}
          selected={viewDate}
          canPrev={canPrevWeek}
          canNext={canNextWeek}
          monthOpen={monthOpen}
          onSelect={onDay}
          onPrevWeek={() => goWeek(-1)}
          onNextWeek={() => goWeek(1)}
          onToggleMonth={() => {
            pendingFocus.current = 'month';
            setViewMonth(monthOf(viewDate));
            setMonthOpen(true);
          }}
        />
      )}

      {monthOpen ? null : (
        <DayPanel {...props} days={days} canNextWeek={canNextWeek} onNextWeek={() => goWeek(1)} />
      )}
    </div>
  );
}

interface DayPanelProps extends TimeStepProps {
  days: Load<AvailabilityDay[]>;
  canNextWeek: boolean;
  onNextWeek: () => void;
}

function DayPanel({ business, today, lastDay, viewDate, part, slot, days, onPart, onSlot, onDay, onRetry, canNextWeek, onNextWeek }: DayPanelProps) {
  const { timezone, locale } = business;
  const title = (
    <h4 className="dayhead">
      {longDate(viewDate, locale)}
      {viewDate === today ? <span className="dayhead__tag">Today</span> : null}
    </h4>
  );

  if (days.status === 'loading') {
    return (
      <div className="daypanel" aria-busy="true">
        {title}
        <p className="visually-hidden" role="status">
          Loading times…
        </p>
        <div className="parts parts--loading" aria-hidden="true">
          <span className="skeleton skeleton--tab" />
          <span className="skeleton skeleton--tab" />
          <span className="skeleton skeleton--tab" />
        </div>
        <ul className="slots" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <span className="skeleton skeleton--slot" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (days.status === 'error') {
    return (
      <div className="daypanel">
        {title}
        <div className="panel-message panel-message--alert" role="alert">
          <p className="panel-message__title">Times didn’t load</p>
          <p>{problemText(days.error)}</p>
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const day = days.data.find((d) => d.date === viewDate);
  const next = nextAvailableDay(days.data, viewDate);
  const nextButton = next ? (
    <button type="button" className="btn btn--secondary" onClick={() => onDay(next.date)}>
      Next open: {relativeDay(next.date, today, locale)} from {formatTime(next.slots[0].startsAt, timezone, locale)}
    </button>
  ) : canNextWeek ? (
    <button type="button" className="btn btn--secondary" onClick={onNextWeek}>
      See the next two weeks
    </button>
  ) : (
    <p>No online times left in the booking window — call the shop and we’ll help.</p>
  );

  if (!day || day.status === 'unavailable') {
    const beyond = viewDate > lastDay;
    return (
      <div className="daypanel">
        {title}
        <div className="panel-message" role="status">
          <p className="panel-message__title">{beyond ? 'Not open for booking yet' : 'This day has passed'}</p>
          <p>
            {beyond
              ? `Appointments open up to ${business.policies.maxAdvanceDays} days ahead.`
              : 'Pick today or a day ahead.'}
          </p>
          {nextButton}
        </div>
      </div>
    );
  }

  if (day.status === 'full' || day.status === 'closed') {
    const full = day.status === 'full';
    const when = viewDate === today ? ' today' : '';
    return (
      <div className="daypanel">
        {title}
        <div className={`panel-message panel-message--${day.status}`} role="status">
          <p className="panel-message__title">{full ? `Fully booked${when}` : `Closed${when}`}</p>
          <p>{full ? 'Every time is taken. The next open day is close by:' : 'No appointments this day. Here’s the next open day:'}</p>
          {nextButton}
        </div>
      </div>
    );
  }

  const groups = groupSlotsByPartOfDay(day.slots);
  const few = isFewLeft(day);
  const slotButton = (s: (typeof day.slots)[number]) => {
    const chosen = slot?.startsAt === s.startsAt;
    return (
      <li key={s.startsAt}>
        <button
          type="button"
          className={`slot${chosen ? ' is-chosen' : ''}`}
          aria-pressed={chosen}
          onClick={() => onSlot({ date: day.date, ...s })}
        >
          {formatTime(s.startsAt, timezone, locale)}
        </button>
      </li>
    );
  };
  const fewLine = few ? (
    <p className="few-left">
      Only {day.slots.length} {day.slots.length === 1 ? 'time' : 'times'} left this day
    </p>
  ) : null;

  // A normal day: every part of the day at once, each with its count.
  if (day.slots.length <= STACK_LIMIT) {
    return (
      <div className="daypanel">
        {title}
        {fewLine}
        <div className="partlist">
          {groups
            .filter((group) => group.slots.length > 0)
            .map((group) => (
              <section className="part" key={group.part} aria-label={`${PART_NAMES[group.part]} times`}>
                <h5 className="part__name">
                  {PART_NAMES[group.part]}
                  <span className="part__count">
                    {group.slots.length} {group.slots.length === 1 ? 'time' : 'times'}
                  </span>
                </h5>
                <ul className="slots">{group.slots.map(slotButton)}</ul>
              </section>
            ))}
        </div>
      </div>
    );
  }

  // A very open day: one part of the day at a time.
  const slotHere = slot && slot.date === viewDate ? slot : null;
  const preferred = part ?? (slotHere ? partOfDay(slotHere.time) : null);
  const active =
    groups.find((g) => g.part === preferred && g.slots.length > 0) ?? groups.find((g) => g.slots.length > 0) ?? groups[0];

  return (
    <div className="daypanel">
      {title}
      <div className="parts" role="group" aria-label="Part of the day">
        {groups.map((group) => (
          <button
            key={group.part}
            type="button"
            className="parts__btn"
            aria-pressed={group.part === active.part}
            disabled={group.slots.length === 0}
            onClick={() => onPart(group.part)}
          >
            <span>{PART_NAMES[group.part]}</span>
            <span className="parts__count">
              {group.slots.length}
              <span className="visually-hidden"> {group.slots.length === 1 ? 'time' : 'times'}</span>
            </span>
          </button>
        ))}
      </div>
      {fewLine}
      <ul className="slots" aria-label={`${PART_NAMES[active.part]} times`}>
        {active.slots.map(slotButton)}
      </ul>
    </div>
  );
}
