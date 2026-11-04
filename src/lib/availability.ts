import { useEffect, useState } from 'react';
import {
  addMonths,
  monthGrid,
  monthOf,
  nextAvailableDay,
  type Availability,
  type AvailabilityDay,
  type Result,
  type Slot,
  type Weekday,
} from '@profitstudio/booking-engine';
import { engine } from './engine';
import { LOADING, type Load } from './load';

/**
 * One getAvailability call per service and visible month (the month grid's
 * range, at most 42 days). The hero's "next open chair", the week strip and the
 * month calendar share these calls. Entries expire after a minute; the flow
 * drops them at once after a time was taken or released.
 */
const TTL_MS = 60_000;
const cache = new Map<string, { at: number; promise: Promise<Result<Availability>> }>();

export function loadMonth(serviceId: string, month: string, firstDay: Weekday): Promise<Result<Availability>> {
  const grid = monthGrid(month, firstDay);
  const key = `${serviceId}|${grid.from}|${grid.to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;
  const promise = engine.getAvailability({ serviceId, from: grid.from, to: grid.to }).then((result) => {
    if (!result.ok) cache.delete(key);
    return result;
  });
  cache.set(key, { at: Date.now(), promise });
  return promise;
}

export function invalidateAvailability(serviceId?: string): void {
  for (const key of [...cache.keys()]) {
    if (!serviceId || key.startsWith(`${serviceId}|`)) cache.delete(key);
  }
}

/** The days of one month grid for a service, as the server returned them. */
export function useMonthDays(
  serviceId: string | null,
  month: string | null,
  firstDay: Weekday,
  version: number,
): Load<AvailabilityDay[]> {
  const key = serviceId && month ? `${serviceId}|${month}|${firstDay}|${version}` : null;
  const [state, setState] = useState<{ key: string; load: Load<AvailabilityDay[]> } | null>(null);

  useEffect(() => {
    if (!serviceId || !month || !key) return;
    let alive = true;
    void loadMonth(serviceId, month, firstDay).then((r) => {
      if (alive) setState({ key, load: r.ok ? { status: 'ready', data: r.data.days } : { status: 'error', error: r.error } });
    });
    return () => {
      alive = false;
    };
  }, [serviceId, month, firstDay, key]);

  return state && state.key === key ? state.load : LOADING;
}

export interface Soonest {
  day: AvailabilityDay;
  slot: Slot;
}

/**
 * The soonest bookable time for a service, from the month grids the calendar
 * loads anyway: this month, and the next one only when this one has nothing
 * left (and it is inside the booking window).
 */
export function useSoonest(
  serviceId: string | null,
  today: string | null,
  lastDay: string | null,
  firstDay: Weekday,
  version: number,
): Load<Soonest | null> {
  const key = serviceId && today && lastDay ? `${serviceId}|${today}|${lastDay}|${firstDay}|${version}` : null;
  const [state, setState] = useState<{ key: string; load: Load<Soonest | null> } | null>(null);

  useEffect(() => {
    if (!serviceId || !today || !lastDay || !key) return;
    let alive = true;
    const first = monthOf(today);
    const last = monthOf(lastDay);
    const search = async (): Promise<Load<Soonest | null>> => {
      for (let month = first; month <= last; month = addMonths(month, 1)) {
        const r = await loadMonth(serviceId, month, firstDay);
        if (!r.ok) return { status: 'error', error: r.error };
        const day = nextAvailableDay(r.data.days.filter((d) => d.date >= today));
        if (day && day.slots.length > 0) return { status: 'ready', data: { day, slot: day.slots[0] } };
      }
      return { status: 'ready', data: null };
    };
    void search().then((load) => {
      if (alive) setState({ key, load });
    });
    return () => {
      alive = false;
    };
  }, [serviceId, today, lastDay, firstDay, key]);

  return state && state.key === key ? state.load : LOADING;
}
