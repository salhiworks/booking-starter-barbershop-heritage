import { isDefault, useContent } from '../lib/content';
import { SectionHead } from './SectionHead';

/** Quotes from clients — placeholder examples, clearly labelled, until the owner adds real ones. */
export function KindWords() {
  const content = useContent();
  const { values } = content;
  if (!values['reviews.show']) return null;
  const examples = isDefault(content, 'reviews.items');
  const items = values['reviews.items'];

  return (
    <section className="words" id="words" aria-labelledby="words-title">
      <div className="wrap">
        <SectionHead className="section-head--on-dark" number="06" label="From the chair" title={values['reviews.title']} titleId="words-title">
          {examples ? (
            <p className="tag tag--on-dark">Placeholder examples — not real reviews</p>
          ) : null}
        </SectionHead>
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
