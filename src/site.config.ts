/**
 * This website's identity — the ONE place for its name, time zone and the
 * placeholder contact details shown in preview mode (`npm run dev` without
 * Supabase). Everything the owner manages (services, prices, hours, real
 * contact details, text and photos) lives in the dashboard at /admin/.
 */
export const SITE = {
  /** The business name. The dashboard's Business page overrides it once connected. */
  name: 'Northline Barbers',
  /** IANA time zone of the business. */
  timezone: 'America/New_York',
  /** Fictional contact details for preview mode only. */
  previewContact: {
    email: 'hello@northlinebarbers.example',
    phone: '+1 (718) 555-0142',
    address: '57 Northline Avenue, Brooklyn, NY',
  },
};
