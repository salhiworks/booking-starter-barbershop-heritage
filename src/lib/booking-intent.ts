import { createContext, useContext } from 'react';

/**
 * Lets any section (hero, menu, footer) open the booking flow, optionally with
 * a service already chosen. `nonce` changes on every request so the same
 * service can be asked for twice.
 */
export interface BookingIntent {
  serviceId: string | null;
  nonce: number;
}

export interface BookingIntentApi {
  intent: BookingIntent | null;
  startBooking: (serviceId?: string | null) => void;
}

export const BookingIntentContext = createContext<BookingIntentApi | null>(null);

export function useBookingIntent(): BookingIntentApi {
  const value = useContext(BookingIntentContext);
  if (!value) throw new Error('useBookingIntent must be used inside <App>');
  return value;
}
