import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { contrastRatio, isHexColor } from '@profitstudio/booking-engine';
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
    const board = values['brand.board'];
    root.style.setProperty('--green', board);
    root.style.setProperty('--oxblood', values['brand.accent']);
    root.dataset.headings = values['brand.headings'];
    // Brass numerals on the board only while they stay readable on the owner's green.
    const brass = getComputedStyle(root).getPropertyValue('--brass-light').trim();
    const brassReadable = isHexColor(brass) ? contrastRatio(brass, board) >= 4.5 : true;
    root.style.setProperty('--board-accent', brassReadable ? 'var(--brass-light)' : 'var(--board-text)');
    document.title = values['seo.title'];
    document.querySelector('meta[name="description"]')?.setAttribute('content', values['seo.description']);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', board);
  }, [values]);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}
