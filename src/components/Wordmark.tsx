import { useContent } from '../lib/content';
import { useSiteData } from '../lib/site-data';

/**
 * The owner's logo when they set one; otherwise the business name (from the
 * engine) set as a condensed poster word.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  const { values } = useContent();
  const { business } = useSiteData();
  const logo = values['brand.logo'];
  const name =
    business.status === 'ready'
      ? business.data.name
      : business.status === 'error'
        ? values['seo.title'].split(' — ')[0]
        : null;

  if (logo) {
    return (
      <span className={`wordmark wordmark--logo ${className}`}>
        <img className="wordmark__logo" src={logo.src} alt={logo.alt || name || ''} width={logo.width} height={logo.height} />
      </span>
    );
  }
  return (
    <span className={`wordmark ${className}`}>
      {name ? (
        <span className="wordmark__name">{name}</span>
      ) : (
        <span className="wordmark__name wordmark__name--loading" aria-hidden="true" />
      )}
    </span>
  );
}
