import { useCallback, useMemo, useState } from 'react';
import { Barbers } from './components/Barbers';
import { BookingSection } from './components/booking/BookingSection';
import { ContentProvider } from './components/ContentProvider';
import { Hero } from './components/Hero';
import { KindWords } from './components/KindWords';
import { MenuBoard } from './components/MenuBoard';
import { PreviewBanner } from './components/PreviewBanner';
import { Shop } from './components/Shop';
import { SiteDataProvider } from './components/SiteDataProvider';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { Visit } from './components/Visit';
import { BookingIntentContext, type BookingIntent, type BookingIntentApi } from './lib/booking-intent';

export function App() {
  const [intent, setIntent] = useState<BookingIntent | null>(null);
  const startBooking = useCallback((serviceId?: string | null) => {
    setIntent((previous) => ({ serviceId: serviceId ?? null, nonce: (previous?.nonce ?? 0) + 1 }));
  }, []);
  const bookingApi = useMemo<BookingIntentApi>(() => ({ intent, startBooking }), [intent, startBooking]);

  return (
    <ContentProvider>
      <SiteDataProvider>
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
            <KindWords />
            <Visit />
          </main>
          <SiteFooter />
        </BookingIntentContext.Provider>
      </SiteDataProvider>
    </ContentProvider>
  );
}
