import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { ContentContext, contentStore } from '../lib/content';

/**
 * Owner content: synchronous first paint (build snapshot / cached copy /
 * defaults), then the current published copy. Brand values are mapped onto the
 * design's own CSS variables before paint.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => contentStore.initial());

  useEffect(() => {
    let alive = true;
    void contentStore.load().then((next) => {
      if (alive) setState(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  const values = state.values;
  useLayoutEffect(() => {
    const root = document.documentElement;
    const dark = values['brand.board'];
    // The dashboard checks both colours against white text (see content/site.ts).
    root.style.setProperty('--brand-dark', dark);
    root.style.setProperty('--action', values['brand.accent']);
    root.dataset.headings = values['brand.headings'];
    root.dataset.photos = values['brand.photos'];
    document.title = values['seo.title'];
    document.querySelector('meta[name="description"]')?.setAttribute('content', values['seo.description']);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark);
  }, [values]);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}
