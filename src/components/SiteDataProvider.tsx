import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Business, Service } from '@profitstudio/booking-engine';
import { engine } from '../lib/engine';
import { fromResult, LOADING, type Load } from '../lib/load';
import { SiteDataContext, type SiteData } from '../lib/site-data';

/** Reads the business and its services once; every section shares them. */
export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Load<Business>>(LOADING);
  const [services, setServices] = useState<Load<Service[]>>(LOADING);
  const [businessRun, setBusinessRun] = useState(0);
  const [servicesRun, setServicesRun] = useState(0);

  useEffect(() => {
    let alive = true;
    void engine.getBusiness().then((r) => {
      if (alive) setBusiness(fromResult(r));
    });
    return () => {
      alive = false;
    };
  }, [businessRun]);

  useEffect(() => {
    let alive = true;
    void engine.listServices().then((r) => {
      if (alive) setServices(fromResult(r));
    });
    return () => {
      alive = false;
    };
  }, [servicesRun]);

  // A reload keeps what is on screen until the new answer arrives (the booking
  // flow must not unmount mid-booking); only a failed read starts from "loading".
  const reloadBusiness = useCallback(() => {
    setBusiness((current) => (current.status === 'ready' ? current : LOADING));
    setBusinessRun((n) => n + 1);
  }, []);
  const reloadServices = useCallback(() => {
    setServices((current) => (current.status === 'ready' ? current : LOADING));
    setServicesRun((n) => n + 1);
  }, []);

  const value = useMemo<SiteData>(
    () => ({ business, services, reloadBusiness, reloadServices }),
    [business, services, reloadBusiness, reloadServices],
  );
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}
