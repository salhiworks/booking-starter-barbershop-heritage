import { useEffect, useState } from 'react';
import {
  addDays,
  localTimeLabel,
  todayInTimeZone,
  weekdayOf,
  type Business,
  type OpeningTimesDay,
} from '@profitstudio/booking-engine';
import { engine } from './engine';
import { clockLabel, hoursForWeekday, relativeDay } from './format';
import { LOADING, type Load } from './load';
import { useNow } from './use-now';

const RANGE_DAYS = 14;

export interface OpeningStatus {
  open: boolean;
  text: string;
}

/** The weekly pattern as dated days — the fallback for databases without opening times. */
function daysFromWeeklyPattern(business: Business, from: string, count: number): OpeningTimesDay[] {
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(from, i);
    return { date, hours: hoursForWeekday(business.openingHours, weekdayOf(date)) };
  });
}

/**
 * When the shop is really open over the next two weeks: weekly hours minus
 * closures (whole and partial days), from getOpeningTimes. On a database older
 * than schema 2.0.0-alpha.10 (SCHEMA_INCOMPATIBLE) it falls back to the weekly
 * pattern, as INTEGRATION.md §6 says.
 */
export function useOpeningDays(business: Business | null): Load<OpeningTimesDay[]> {
  const now = useNow(60_000, business !== null);
  const today = business ? todayInTimeZone(business.timezone, new Date(now)) : null;
  const [state, setState] = useState<{ key: string; load: Load<OpeningTimesDay[]> } | null>(null);
  const key = business && today ? `${business.timezone}|${today}` : null;

  useEffect(() => {
    if (!business || !today || !key) return;
    let alive = true;
    void engine.getOpeningTimes({ from: today, to: addDays(today, RANGE_DAYS - 1) }).then((r) => {
      if (!alive) return;
      if (r.ok) setState({ key, load: { status: 'ready', data: r.data.days } });
      else if (r.error.code === 'SCHEMA_INCOMPATIBLE')
        setState({ key, load: { status: 'ready', data: daysFromWeeklyPattern(business, today, RANGE_DAYS) } });
      else setState({ key, load: { status: 'error', error: r.error } });
    });
    return () => {
      alive = false;
    };
  }, [business, today, key]);

  return state && state.key === key ? state.load : LOADING;
}

/**
 * "Open now · until 7:00 PM", "Opens today at 10:00 AM",
 * "Closed now · reopens today at 2:00 PM", "Closed today · opens Tuesday at 10:00 AM".
 * Display only — bookable times come from getAvailability.
 */
export function openingStatus(
  days: readonly OpeningTimesDay[],
  business: Business,
  nowMs: number,
): OpeningStatus | null {
  const { timezone, locale } = business;
  const today = todayInTimeZone(timezone, new Date(nowMs));
  const now = localTimeLabel(nowMs, timezone);
  const todayDay = days.find((d) => d.date === today);

  if (todayDay) {
    const current = todayDay.hours.find((h) => h.start <= now && now < h.end);
    if (current) return { open: true, text: `Open now · until ${clockLabel(current.end, locale)}` };
    const later = todayDay.hours.find((h) => h.start > now);
    if (later) {
      const wasOpen = todayDay.hours.some((h) => h.end <= now);
      return {
        open: false,
        text: wasOpen
          ? `Closed now · reopens today at ${clockLabel(later.start, locale)}`
          : `Opens today at ${clockLabel(later.start, locale)}`,
      };
    }
  }

  const next = days.find((d) => d.date > today && d.hours.length > 0);
  const prefix = todayDay && todayDay.hours.length > 0 ? 'Closed now' : 'Closed today';
  if (!next) return { open: false, text: prefix };
  const when = relativeDay(next.date, today, locale);
  const day = when === 'Tomorrow' ? 'tomorrow' : when;
  return { open: false, text: `${prefix} · opens ${day} at ${clockLabel(next.hours[0].start, locale)}` };
}

/** Upcoming dates whose real hours differ from the weekly pattern (closures, short days). */
export function changesAhead(
  days: readonly OpeningTimesDay[],
  business: Business,
): OpeningTimesDay[] {
  return days.filter((d) => {
    const usual = hoursForWeekday(business.openingHours, weekdayOf(d.date));
    const key = (ranges: ReadonlyArray<{ start: string; end: string }>) =>
      ranges.map((r) => `${r.start}-${r.end}`).join(',');
    return key(usual) !== key(d.hours);
  });
}

/** Live "open now" line for a business, refreshed every minute. */
export function useOpeningStatus(business: Business | null): {
  days: Load<OpeningTimesDay[]>;
  status: OpeningStatus | null;
} {
  const days = useOpeningDays(business);
  const now = useNow(60_000, business !== null);
  const status = business && days.status === 'ready' ? openingStatus(days.data, business, now) : null;
  return { days, status };
}
