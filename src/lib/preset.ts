import type { Preset } from '@profitstudio/booking-engine';

/**
 * Northline's starter data: what preview mode shows, and the set the dashboard
 * offers an owner who has no services yet (<BookingAdmin presets>).
 * Plain data — once connected, services, hours and policies live in the
 * owner's dashboard and the website reads them from the engine.
 */
export const sitePreset = {
  id: 'barbershop',
  label: 'Barbershop',
  terminology: {
    customer: 'client',
    customers: 'clients',
    booking: 'appointment',
    bookings: 'appointments',
  },
  previewBusiness: {
    name: 'Sample Barbershop',
    currency: 'USD',
    locale: 'en-US',
    contact: {
      email: 'hello@example.com',
      phone: '+1 555 0100',
      address: '123 Example Street, Springfield',
    },
  },
  policies: {
    slotIntervalMinutes: 15,
    minNoticeMinutes: 60,
    maxAdvanceDays: 30,
    autoConfirm: false,
    requirePhone: true,
    pendingHoldMinutes: 1440,
    verificationWindowMinutes: 15,
  },
  // weekday: 1 = Monday … 7 = Sunday. Closed Sunday and Monday.
  workingHours: [
    { weekday: 2, start: '10:00', end: '19:00' },
    { weekday: 3, start: '10:00', end: '19:00' },
    { weekday: 4, start: '10:00', end: '19:00' },
    { weekday: 5, start: '10:00', end: '19:00' },
    { weekday: 6, start: '09:00', end: '17:00' },
  ],
  services: [
    {
      name: 'Classic Cut',
      description: 'Scissor or clipper cut, styled and finished with a neck shave.',
      durationMinutes: 30,
      bufferAfterMinutes: 10,
      priceCents: 4000,
    },
    {
      name: 'Skin Fade',
      description: 'Tight fade blended to the skin, shaped on top, sharp line-up.',
      durationMinutes: 45,
      bufferAfterMinutes: 10,
      priceCents: 4500,
    },
    {
      name: 'Beard Trim & Line-up',
      description: 'Shape, trim and a hot-towel line-up for the beard.',
      durationMinutes: 20,
      bufferAfterMinutes: 5,
      priceCents: 2500,
    },
    {
      name: 'Cut & Beard',
      description: 'A full haircut and beard shape in one sitting.',
      durationMinutes: 60,
      bufferAfterMinutes: 10,
      priceCents: 6000,
    },
    {
      name: 'Hot Towel Shave',
      description: 'Straight-razor shave with hot towels and a cool finish.',
      durationMinutes: 40,
      bufferAfterMinutes: 10,
      priceCents: 4500,
    },
    {
      name: 'Buzz Cut',
      description: 'One length all over, cleaned up at the neck and ears.',
      durationMinutes: 20,
      bufferAfterMinutes: 5,
      priceCents: 2500,
    },
    {
      name: 'Kids Cut (under 12)',
      description: 'A patient, quick cut for younger clients.',
      durationMinutes: 30,
      bufferAfterMinutes: 10,
      priceCents: 2800,
    },
  ],
} satisfies Preset;
