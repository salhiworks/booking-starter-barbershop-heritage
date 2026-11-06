import { isDefault, useContent } from '../lib/content';
import { SectionHead } from './SectionHead';

/**
 * Quotes from clients — shown only once the owner has saved real ones. The
 * schema's example quotes guide the owner in the dashboard; the public site
 * never shows invented social proof.
 */
export function KindWords() {
  const content = useContent();
  const { values } = content;
  if (!values['reviews.show'] || isDefault(content, 'reviews.items')) return null;
  const items = values['reviews.items'];

  return (
    <section className="words" id="words" aria-labelledby="words-title">
      <div className="wrap">
        <SectionHead title={values['reviews.title']} titleId="words-title" />
        <ul className="words__list">
          {items.map((item, index) => (
            <li className="words__item" key={`${item.name}-${index}`}>
              <figure>
                <blockquote className="words__quote">
                  <p>{item.quote}</p>
                </blockquote>
                {item.name ? <figcaption className="words__by">{item.name}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
