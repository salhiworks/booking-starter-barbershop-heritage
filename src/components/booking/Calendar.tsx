import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import {
  addDays,
  addMonths,
  daysInMonth,
  formatDate,
  isFewLeft,
  monthGrid,
  monthOf,
  startOfWeek,
  type AvailabilityDay,
  type Weekday,
} from '@profitstudio/booking-engine';
import { longDate } from '../../lib/format';

interface DayContext {
  today: string;
  lastDay: string;
  locale: string;
  /** null while the month is loading: the layout stays, marks wait. */
  days: readonly AvailabilityDay[] | null;
}

function findDay(days: readonly AvailabilityDay[] | null, date: string): AvailabilityDay | undefined {
  return days?.find((d) => d.date === date);
}

/** Past days and days beyond the booking window cannot be chosen; full and closed days can (they explain themselves). */
function isSelectable(date: string, ctx: DayContext): boolean {
  if (date < ctx.today || date > ctx.lastDay) return false;
  const day = findDay(ctx.days, date);
  return !day || day.status !== 'unavailable';
}

function describe(date: string, ctx: DayContext, variant: 'strip' | 'month'): { mark: string; spoken: string; tone: string } {
  if (date < ctx.today) return { mark: '', spoken: 'past', tone: 'past' };
  if (date > ctx.lastDay) return { mark: '', spoken: 'not bookable yet', tone: 'past' };
  const day = findDay(ctx.days, date);
  if (!day) return { mark: '', spoken: 'loading', tone: 'loading' };
  switch (day.status) {
    case 'available':
      if (isFewLeft(day)) {
        const n = day.slots.length;
        return { mark: `${n} left`, spoken: `${n} ${n === 1 ? 'time' : 'times'} left`, tone: 'few' };
      }
      // The strip has room to say how many times are open; the month grid shows a dot.
      return { mark: variant === 'strip' ? `${day.slots.length} open` : '', spoken: 'open', tone: 'open' };
    case 'full':
      return { mark: 'Full', spoken: 'fully booked', tone: 'full' };
    case 'closed':
      return { mark: 'Closed', spoken: 'closed', tone: 'closed' };
    default:
      return { mark: '', spoken: 'not bookable', tone: 'past' };
  }
}

function DayButton({
  date,
  ctx,
  selected,
  focusable,
  variant,
  outside,
  onSelect,
  onFocusDate,
}: {
  date: string;
  ctx: DayContext;
  selected: boolean;
  focusable: boolean;
  variant: 'strip' | 'month';
  outside?: boolean;
  onSelect: (date: string) => void;
  onFocusDate: (date: string) => void;
}) {
  const info = describe(date, ctx, variant);
  const selectable = isSelectable(date, ctx);
  const isToday = date === ctx.today;
  const label = `${longDate(date, ctx.locale)}${isToday ? ', today' : ''}, ${info.spoken}`;
  return (
    <button
      type="button"
      className={`day day--${variant} day--${info.tone}${isToday ? ' is-today' : ''}${selected ? ' is-selected' : ''}${outside ? ' is-outside' : ''}`}
      data-date={date}
      tabIndex={focusable ? 0 : -1}
      aria-pressed={selected}
      aria-label={label}
      disabled={!selectable}
      onClick={() => onSelect(date)}
      onFocus={() => onFocusDate(date)}
    >
      {variant === 'strip' ? (
        <span className="day__weekday" aria-hidden="true">
          {formatDate(date, ctx.locale, { weekday: 'short' })}
        </span>
      ) : null}
      <span className="day__num" aria-hidden="true">
        {Number(date.slice(8))}
      </span>
      <span className="day__mark" aria-hidden="true">
        {info.mark}
      </span>
    </button>
  );
}

/** Moves focus to a day button once React has rendered it. */
function useFocusDay(containerRef: RefObject<HTMLElement | null>) {
  const pending = useRef<string | null>(null);
  useEffect(() => {
    const date = pending.current;
    if (!date) return;
    const button = containerRef.current?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`);
    if (button && !button.disabled) {
      pending.current = null;
      button.focus();
    }
  });
  return (date: string) => {
    pending.current = date;
  };
}

/** The same day of the month `months` away, clamped to that month's length ("12-31" − 1 → "11-30"). */
function sameDayInMonth(date: string, months: number): string {
  const month = addMonths(monthOf(date), months);
  const day = Math.min(Number(date.slice(8)), daysInMonth(month));
  return `${month}-${String(day).padStart(2, '0')}`;
}

/** Step `delta` days from `from`, skipping days that cannot be chosen; stays inside the booking window. */
function stepSelectable(from: string, delta: number, ctx: DayContext): string | null {
  let date = addDays(from, delta);
  const unit = delta > 0 ? 1 : -1;
  for (let guard = 0; guard < 62; guard += 1) {
    if (date < ctx.today || date > ctx.lastDay) return null;
    if (isSelectable(date, ctx)) return date;
    date = addDays(date, unit);
  }
  return null;
}

interface StripProps extends DayContext {
  dates: string[];
  selected: string;
  canPrev: boolean;
  canNext: boolean;
  monthOpen: boolean;
  onSelect: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToggleMonth: () => void;
}

export function WeekStrip(props: StripProps) {
  const { dates, selected, locale, onSelect } = props;
  const ctx: DayContext = props;
  const listRef = useRef<HTMLUListElement>(null);
  const [focusDate, setFocusDate] = useState(selected);
  const queueFocus = useFocusDay(listRef);
  const rovingDate = dates.includes(focusDate) && isSelectable(focusDate, ctx) ? focusDate : selected;

  // The strip scrolls sideways on narrow screens: keep the chosen day in view.
  const firstDate = dates[0];
  useEffect(() => {
    const list = listRef.current;
    const button = list?.querySelector<HTMLElement>(`[data-date="${selected}"]`);
    if (!list || !button) return;
    const left = button.offsetLeft - (list.clientWidth - button.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
  }, [selected, firstDate]);

  const first = dates[0];
  const last = dates[dates.length - 1];
  const sameMonth = monthOf(first) === monthOf(last);
  const label = sameMonth
    ? formatDate(first, locale, { month: 'long', year: 'numeric' })
    : `${formatDate(first, locale, { month: 'short' })} – ${formatDate(last, locale, { month: 'short', year: 'numeric' })}`;

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const current = rovingDate;
    let target: string | null = null;
    if (event.key === 'ArrowRight') target = stepSelectable(current, 1, ctx);
    else if (event.key === 'ArrowLeft') target = stepSelectable(current, -1, ctx);
    else if (event.key === 'Home') target = dates.find((d) => isSelectable(d, ctx)) ?? null;
    else if (event.key === 'End') target = [...dates].reverse().find((d) => isSelectable(d, ctx)) ?? null;
    else return;
    event.preventDefault();
    if (!target || !dates.includes(target)) return;
    setFocusDate(target);
    queueFocus(target);
  };

  return (
    <div className="strip">
      <div className="strip__head">
        <p className="strip__month">{label}</p>
        <div className="strip__nav">
          <button type="button" className="icon-btn" onClick={props.onPrevWeek} disabled={!props.canPrev} aria-label="Previous two weeks">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button type="button" className="icon-btn" onClick={props.onNextWeek} disabled={!props.canNext} aria-label="Next two weeks">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button type="button" className="text-btn strip__toggle" aria-expanded={props.monthOpen} onClick={props.onToggleMonth}>
            {props.monthOpen ? 'Week view' : 'Month'}
          </button>
        </div>
      </div>
      <ul className="strip__days" ref={listRef} onKeyDown={onKeyDown} aria-label="Days">
        {dates.map((date) => (
          <li key={date}>
            <DayButton
              date={date}
              ctx={ctx}
              selected={date === selected}
              focusable={date === rovingDate}
              variant="strip"
              onSelect={onSelect}
              onFocusDate={setFocusDate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MonthProps extends DayContext {
  month: string;
  firstDay: Weekday;
  selected: string;
  onSelect: (date: string) => void;
  onMonth: (month: string) => void;
}

export function MonthCalendar(props: MonthProps) {
  const { month, firstDay, selected, locale, onSelect, onMonth } = props;
  const ctx: DayContext = props;
  const grid = monthGrid(month, firstDay);
  const tableRef = useRef<HTMLTableElement>(null);
  const queueFocus = useFocusDay(tableRef);
  const inGrid = (date: string) => date >= grid.from && date <= grid.to;
  const fallbackFocus =
    inGrid(selected) && isSelectable(selected, ctx)
      ? selected
      : (grid.weeks.flat().find((d) => monthOf(d) === month && isSelectable(d, ctx)) ?? selected);
  const [focusDate, setFocusDate] = useState(fallbackFocus);
  const rovingDate = inGrid(focusDate) && isSelectable(focusDate, ctx) ? focusDate : fallbackFocus;

  const firstMonth = monthOf(ctx.today);
  const lastMonth = monthOf(ctx.lastDay);
  const canPrev = month > firstMonth;
  const canNext = month < lastMonth;

  const moveTo = (target: string | null) => {
    if (!target) return;
    setFocusDate(target);
    queueFocus(target);
    if (!inGrid(target)) onMonth(monthOf(target));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const current = rovingDate;
    const weekStart = startOfWeek(current, firstDay);
    switch (event.key) {
      case 'ArrowRight':
        moveTo(stepSelectable(current, 1, ctx));
        break;
      case 'ArrowLeft':
        moveTo(stepSelectable(current, -1, ctx));
        break;
      case 'ArrowDown':
        moveTo(stepSelectable(current, 7, ctx));
        break;
      case 'ArrowUp':
        moveTo(stepSelectable(current, -7, ctx));
        break;
      case 'PageDown': {
        let target = sameDayInMonth(current, 1);
        if (target > ctx.lastDay) target = ctx.lastDay;
        moveTo(isSelectable(target, ctx) ? target : stepSelectable(target, -1, ctx));
        break;
      }
      case 'PageUp': {
        let target = sameDayInMonth(current, -1);
        if (target < ctx.today) target = ctx.today;
        moveTo(isSelectable(target, ctx) ? target : stepSelectable(target, 1, ctx));
        break;
      }
      case 'Home':
        moveTo(isSelectable(weekStart, ctx) ? weekStart : stepSelectable(weekStart, 1, ctx));
        break;
      case 'End': {
        const weekEnd = addDays(weekStart, 6);
        moveTo(isSelectable(weekEnd, ctx) ? weekEnd : stepSelectable(weekEnd, -1, ctx));
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  };

  const weekdays = grid.weeks[0];

  return (
    <div className="month">
      <div className="month__head">
        <button type="button" className="icon-btn" onClick={() => onMonth(addMonths(month, -1))} disabled={!canPrev} aria-label="Previous month">
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <p className="month__title" aria-live="polite">
          {formatDate(`${month}-01`, locale, { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" className="icon-btn" onClick={() => onMonth(addMonths(month, 1))} disabled={!canNext} aria-label="Next month">
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
      <table className="month__grid" ref={tableRef} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdays.map((date) => (
              <th key={date} scope="col" abbr={formatDate(date, locale, { weekday: 'long' })}>
                {formatDate(date, locale, { weekday: 'narrow' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) => (
                <td key={date}>
                  <DayButton
                    date={date}
                    ctx={ctx}
                    selected={date === selected}
                    focusable={date === rovingDate}
                    variant="month"
                    outside={monthOf(date) !== month}
                    onSelect={onSelect}
                    onFocusDate={setFocusDate}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="month__help">Use the arrow keys to move between days; Page Up and Page Down change the month.</p>
    </div>
  );
}
