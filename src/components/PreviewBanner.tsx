import { useContent } from '../lib/content';
import { engine } from '../lib/engine';

/** Honest banners: preview mode (no backend) and the owner's draft preview. */
export function PreviewBanner() {
  const content = useContent();
  return (
    <>
      {engine.mode === 'preview' ? (
        <p className="banner banner--preview">Preview — sample data, bookings are not saved</p>
      ) : null}
      {content.preview ? (
        <p className="banner banner--draft">Draft preview — only signed-in staff can see this version.</p>
      ) : null}
      {content.previewDenied ? (
        <p className="banner banner--draft">This draft preview is for signed-in staff only. You are seeing the published site.</p>
      ) : null}
    </>
  );
}
