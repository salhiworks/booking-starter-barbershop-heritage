import { createContext, useContext } from 'react';
import type { Business, Service } from '@profitstudio/booking-engine';
import type { Load } from './load';

/** Business details and services, read once from the engine and shared by every section. */
export interface SiteData {
  business: Load<Business>;
  services: Load<Service[]>;
  reloadBusiness: () => void;
  reloadServices: () => void;
}

export const SiteDataContext = createContext<SiteData | null>(null);

export function useSiteData(): SiteData {
  const value = useContext(SiteDataContext);
  if (!value) throw new Error('useSiteData must be used inside <SiteDataProvider>');
  return value;
}
