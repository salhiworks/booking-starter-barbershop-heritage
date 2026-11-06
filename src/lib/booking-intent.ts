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
  /** False while online booking is known not to be possible: Book buttons then say how to book instead. */
  online: boolean;
}

/** What a general Book button says: the owner's label, or "How to book" while booking is offline. */
export const OFFLINE_CTA = 'How to book';

export const BookingIntentContext = createContext<BookingIntentApi | null>(null);

export function useBookingIntent(): BookingIntentApi {
  const value = useContext(BookingIntentContext);
  if (!value) throw new Error('useBookingIntent must be used inside <App>');
  return value;
}
