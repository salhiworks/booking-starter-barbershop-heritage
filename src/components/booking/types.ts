import type { BookingConfirmation } from '@profitstudio/booking-engine';

export type Step = 'service' | 'time' | 'details' | 'code' | 'done';
export type FlowStep = Exclude<Step, 'done'>;

/** Step names are always shown in words, never only as a number. */
export const STEPS: ReadonlyArray<{ id: FlowStep; name: string; title: string }> = [
  { id: 'service', name: 'Service', title: 'Choose a service' },
  { id: 'time', name: 'Day & time', title: 'Pick a day and time' },
  { id: 'details', name: 'Your details', title: 'Your details' },
  { id: 'code', name: 'Email code', title: 'Check your email' },
];

/** A slot exactly as getAvailability returned it, plus its business-local date. */
export interface ChosenSlot {
  date: string;
  startsAt: string;
  endsAt: string;
  time: string;
}

export interface Details {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export type DetailField = keyof Details;
export type FieldErrors = Partial<Record<DetailField, string>>;

export interface Notice {
  tone: 'info' | 'alert';
  text: string;
}

export type Blocked = 'disabled' | 'setup' | 'unavailable';

export type Outcome =
  | { kind: 'booked'; confirmation: BookingConfirmation; email: string }
  | { kind: 'preview'; slot: ChosenSlot; email: string }
  | { kind: 'limit' };
