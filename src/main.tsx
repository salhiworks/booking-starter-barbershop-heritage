import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted type (fontsource): the browser downloads only the faces in use.
// Archivo's width + weight file: condensed display, names and text from one family.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
// Only downloaded when the owner picks the "High-contrast serif" heading style.
import '@fontsource/dm-serif-display/latin-400.css';
// The visual system: tokens first, then everything that uses them.
import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';
import './styles/booking.css';
import { App } from './App';
import { engine } from './lib/engine';
import type { DemoEngine } from './demo/engine';

if (__BOOKING_DEMO__) void import('./demo/engine/DemoBar').then((m) => m.mountDemoBar(engine as DemoEngine, 'site'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
