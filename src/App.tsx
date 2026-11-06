import { useCallback, useEffect, useMemo, useState } from 'react';
import { Barbers } from './components/Barbers';
import { BookingSection } from './components/booking/BookingSection';
import { BookingSheet } from './components/booking/BookingSheet';
import { ContentProvider } from './components/ContentProvider';
import { Hero } from './components/Hero';
import { KindWords } from './components/KindWords';
import { MenuBoard } from './components/MenuBoard';
import { PreviewBanner } from './components/PreviewBanner';
import { FirstVisit, Shop } from './components/Shop';
import { SiteDataProvider } from './components/SiteDataProvider';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { Visit } from './components/Visit';
import { BookingIntentContext, type BookingIntent, type BookingIntentApi } from './lib/booking-intent';
import { revealAndFocus } from './lib/motion';
import { useSiteData } from './lib/site-data';

export function App() {
  return (
    <ContentProvider>
      <SiteDataProvider>
        <Page />
      </SiteDataProvider>
    </ContentProvider>
  );
}

const BOOK_HASH = '#book';
const isBookingEntry = () => Boolean((history.state as { booking?: boolean } | null)?.booking);
const withoutHash = () => `${location.pathname}${location.search}`;

/** One page of sections, plus the booking sheet over it at #book. No routes. */
function Page() {
  const { business, services } = useSiteData();
  const [intent, setIntent] = useState<BookingIntent | null>(null);

  // Online booking is known not to be possible (paused, nothing to book, a load
  // problem): "Book" leads to the #book section and its explanation instead.
  const bookingOff =
    business.status === 'error' ||
    services.status === 'error' ||
    (business.status === 'ready' && !business.data.policies.onlineBookingEnabled) ||
    (services.status === 'ready' && services.data.length === 0);

  // Arriving at /#book opens the sheet straight away (unless booking is off).
  const [open, setOpen] = useState(() => location.hash === BOOK_HASH);
  const sheetOpen = open && !bookingOff;

  const showSheet = useCallback(() => {
    // One history entry for the sheet, so Back (or a phone's back gesture) closes it.
    if (!isBookingEntry()) history.pushState({ ...(history.state as object | null), booking: true }, '', BOOK_HASH);
    setOpen(true);
  }, []);

  const startBooking = useCallback(
    (serviceId?: string | null) => {
      if (bookingOff) {
        const section = document.getElementById('book');
        const heading = section?.querySelector<HTMLElement>('#book-title') ?? null;
        if (heading && !heading.hasAttribute('tabindex')) heading.tabIndex = -1;
        revealAndFocus(heading ?? section);
        return;
      }
      setIntent((previous) => ({ serviceId: serviceId ?? null, nonce: (previous?.nonce ?? 0) + 1 }));
      showSheet();
    },
    [bookingOff, showSheet],
  );

  const close = useCallback(() => {
    if (isBookingEntry()) history.back();
    else {
      history.replaceState(history.state, '', withoutHash());
      setOpen(false);
    }
  }, []);

  // Back / forward through the sheet's history entry; #book typed or linked.
  useEffect(() => {
    const sync = () => setOpen(isBookingEntry() || location.hash === BOOK_HASH);
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  // …and a direct visit to /#book gets its own entry, so Back returns to the page, not away from the site.
  useEffect(() => {
    if (location.hash !== BOOK_HASH || isBookingEntry()) return;
    history.replaceState(history.state, '', withoutHash());
    history.pushState({ booking: true }, '', BOOK_HASH);
  }, []);

  const bookingApi = useMemo<BookingIntentApi>(() => ({ intent, startBooking, online: !bookingOff }), [intent, startBooking, bookingOff]);

  return (
    <BookingIntentContext.Provider value={bookingApi}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PreviewBanner />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <MenuBoard />
        <BookingSection />
        <Barbers />
        <Shop />
        <FirstVisit />
        <KindWords />
        <Visit />
      </main>
      <SiteFooter />
      <BookingSheet open={sheetOpen} onClose={close} />
    </BookingIntentContext.Provider>
  );
}
