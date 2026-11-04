import { createContext, useContext } from 'react';
import {
  createSiteContentStore,
  readSiteContentSnapshot,
  type SiteContentState,
} from '@profitstudio/booking-engine';
import { siteContent, type SiteContent } from '../content/site';
import { engine } from './engine';

/** The owner's website content: the build-time snapshot first, then the published copy. */
export const contentStore = createSiteContentStore(engine, siteContent, {
  snapshot: readSiteContentSnapshot(),
});

export type ContentState = SiteContentState<SiteContent>;
export type ContentValues = ContentState['values'];

export const ContentContext = createContext<ContentState | null>(null);

export function useContent(): ContentState {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside <ContentProvider>');
  return value;
}

/** True while a field still shows the website's default (the owner has not set it). */
export function isDefault(state: ContentState, id: keyof ContentValues): boolean {
  return !state.ownerFields.includes(id);
}
