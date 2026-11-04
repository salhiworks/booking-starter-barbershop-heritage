import type { DemoConfig } from './engine';
import { sitePreset } from '../lib/preset';

/**
 * The public Live Demo's sample shop (`npm run dev:demo` / `npm run build:demo`).
 * Only demo builds read this file. Customizing the real website? Leave src/demo/ alone.
 */
export const demoConfig: DemoConfig = {
  id: 'barbershop-heritage',
  preset: sitePreset,
  business: {
    name: 'Northline Barbers',
    timezone: 'America/New_York',
    email: 'hello@northlinebarbers.example',
    phone: '+1 (718) 555-0142',
    address: '57 Northline Avenue, Brooklyn, NY',
  },
  ownerEmail: 'owner@northlinebarbers.example',
  referencePrefix: 'NB',
  sampleNotes: ['Same fade as last time, a touch shorter on top.', 'Beard getting long — line-up please.', 'First time here, my friend Marcus sent me.'],
  // The site caches published content under this key (createSiteContentStore's default).
  resetKeys: ['pbe-site-content'],
  customers: [
    { name: 'Andre Whitaker', email: 'andre.w@example.com', phone: '+1 718 555 0117' },
    { name: 'Tomasz Nowak', email: 'tomasz.nowak@example.com', phone: '+1 718 555 0124' },
    { name: 'Kwame Asante', email: 'kwame.asante@example.com', phone: '+1 718 555 0131' },
    { name: 'Luis Ortega', email: 'luis.ortega@example.com', phone: '+1 718 555 0139' },
    { name: 'Ben Hollis', email: 'ben.hollis@example.com', phone: '+1 718 555 0145' },
    { name: 'Samir Haddad', email: 'samir.h@example.com', phone: '+1 718 555 0153' },
    { name: 'Owen Gallagher', email: 'owen.g@example.com', phone: '+1 718 555 0168' },
    { name: 'Jae-won Park', email: 'jaewon.park@example.com', phone: '+1 718 555 0176' },
    { name: 'Malik Brooks', email: 'malik.brooks@example.com', phone: '+1 718 555 0182' },
    { name: 'Felix Andersen', email: 'felix.a@example.com', phone: '+1 718 555 0190' },
  ],
};
