import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { publishedSiteContent } from '@profitstudio/booking-engine/vite';
import { siteContent } from './src/content/site.ts';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // The public Live Demo build (`--mode demo`): src/lib/engine.ts swaps in the
  // in-browser demo engine (src/demo/). Every other build leaves it out.
  define: { __BOOKING_DEMO__: JSON.stringify(mode === 'demo') },
  plugins: [
    // …and keeps the demo's sample data out of it too: outside demo mode,
    // src/demo/config resolves to an empty module.
    {
      name: 'booking-demo-config-off',
      enforce: 'pre',
      resolveId: (id) => (mode !== 'demo' && /\/demo\/config(\.ts)?$/.test(id) ? '\0booking-demo-off' : null),
      load: (id) => (id === '\0booking-demo-off' ? 'export const demoConfig = undefined;' : null),
    },
    react(),
    // Bakes the owner's PUBLISHED website content into index.html at build time:
    // <title>, meta description, og: tags and a first-paint snapshot.
    publishedSiteContent({
      schema: siteContent,
      env: loadEnv(mode, process.cwd(), 'VITE_'),
      meta: (values) => ({ title: values['seo.title'], description: values['seo.description'] }),
    }),
  ],
  build: {
    // Two real HTML pages: the public site and the packaged dashboard on /admin/.
    // (Vite 8 runs on Rolldown: `rolldownOptions` replaces the deprecated `rollupOptions`.)
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
      },
    },
  },
}));
