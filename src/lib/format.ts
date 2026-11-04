import {
  addDays,
  formatClockTime,
  formatDate,
  formatMoney,
  type OpeningHoursInterval,
  type Service,
  type Weekday,
} from '@profitstudio/booking-engine';

/** "$40", "from $40", or "Price on request" — from the engine's service data. */
export function priceLabel(
  service: Pick<Service, 'priceCents' | 'priceFrom' | 'currency'>,
  locale: string,
): string {
  if (service.priceCents === null) return 'Price on request';
  const money = formatMoney(service.priceCents, service.currency, locale);
  return service.priceFrom ? `from ${money}` : money;
}

export function durationLabel(minutes: number): string {
  return `${minutes} min`;
}

/** "Today", "Tomorrow", "Thursday" (this week) or "Thu, Nov 12". */
export function relativeDay(date: string, today: string, locale: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  for (let i = 2; i < 7; i += 1) {
    if (date === addDays(today, i)) return formatDate(date, locale, { weekday: 'long' });
  }
  return formatDate(date, locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function longDate(date: string, locale: string): string {
  return formatDate(date, locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function shortDate(date: string, locale: string): string {
  return formatDate(date, locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Opening-hour clock labels: "9:00 AM", or "midnight" for "24:00". */
export function clockLabel(hhmm: string, locale: string): string {
  if (hhmm === '24:00') return 'midnight';
  return keepTogether(formatClockTime(hhmm, locale));
}

/** "10:00 AM" never breaks before "AM". */
export function keepTogether(time: string): string {
  return time.replace(/\s+(?=[AaPp]\.?[Mm])/g, '\u00a0');
}

/** Compact clock for signage: "10 AM", "9:30 AM". */
export function compactClock(hhmm: string, locale: string): string {
  if (hhmm === '24:00') return 'midnight';
  const minutes = hhmm.slice(3);
  return formatClockTime(hhmm, locale, minutes === '00' ? { hour: 'numeric' } : { hour: 'numeric', minute: '2-digit' });
}

export function rangesLabel(ranges: ReadonlyArray<{ start: string; end: string }>, locale: string): string {
  return ranges.map((r) => `${clockLabel(r.start, locale)} – ${clockLabel(r.end, locale)}`).join(', ');
}

export const WEEKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/** Weekday names without guessing a year: 2024-01-01 was a Monday. */
export function weekdayName(weekday: Weekday, locale: string, style: 'long' | 'short' = 'long'): string {
  return formatDate(`2024-01-0${weekday}`, locale, { weekday: style });
}

export function hoursForWeekday(
  openingHours: readonly OpeningHoursInterval[],
  weekday: Weekday,
): Array<{ start: string; end: string }> {
  return openingHours
    .filter((h) => h.weekday === weekday)
    .map((h) => ({ start: h.start, end: h.end }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * The weekly pattern as a door sign: consecutive days with the same hours
 * share a line ("Tue–Fri 10 AM–7 PM"). Closed days are left out.
 */
export function signHours(openingHours: readonly OpeningHoursInterval[], locale: string): string[] {
  const lines: string[] = [];
  let runStart: Weekday | null = null;
  let runKey = '';
  const flush = (end: Weekday) => {
    if (runStart === null || !runKey) return;
    const days =
      runStart === end
        ? weekdayName(runStart, locale, 'short')
        : `${weekdayName(runStart, locale, 'short')}–${weekdayName(end, locale, 'short')}`;
    const ranges = hoursForWeekday(openingHours, runStart)
      .map((r) => `${compactClock(r.start, locale)}–${compactClock(r.end, locale)}`)
      .join(', ');
    lines.push(`${days} ${ranges}`);
  };
  let previous: Weekday | null = null;
  for (const weekday of WEEKDAYS) {
    const key = hoursForWeekday(openingHours, weekday)
      .map((r) => `${r.start}-${r.end}`)
      .join(',');
    if (key !== runKey || runStart === null) {
      if (previous !== null) flush(previous);
      runStart = weekday;
      runKey = key;
    }
    previous = weekday;
  }
  if (previous !== null) flush(previous);
  return lines;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function smsHref(phone: string): string {
  return `sms:${phone.replace(/[^\d+]/g, '')}`;
}

export function mapsHref(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** "No. 01" style numbering for menu rows and plates. */
export function menuNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
