import { useContent } from '../lib/content';
import { Picture } from './Picture';
import { SectionHead } from './SectionHead';

/** The room on a dark band: the wide photo, a few notes and a detail. */
export function Shop() {
  const { values } = useContent();
  const room = values['shop.photo'];
  const detail = values['shop.detail'];
  const notes = values['shop.notes'];

  return (
    <section className="shop" id="shop" aria-labelledby="shop-title">
      <div className="wrap">
        <SectionHead className="section-head--on-dark" title={values['shop.title']} titleId="shop-title" lede={values['shop.lede']} />
        {room ? (
          <div className="frame frame--room shop__room">
            <Picture image={room} sizes="(min-width: 1360px) 1264px, 92vw" />
          </div>
        ) : null}
        {notes.length > 0 || detail ? (
          <div className={`shop__grid${detail ? '' : ' shop__grid--no-detail'}`}>
            {notes.length > 0 ? (
              <dl className="notes">
                {notes.map((note, index) => (
                  <div className="notes__item" key={`${note.title}-${index}`}>
                    <dt className="notes__title">{note.title}</dt>
                    <dd className="notes__text">{note.text}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {detail ? (
              <div className="frame frame--portrait shop__detail">
                <Picture image={detail} sizes="(min-width: 1000px) 400px, (min-width: 720px) 45vw, 90vw" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * A first visit, step by step (the owner's shop.steps) — the practical
 * section a newcomer needs, on the light ground after the shop.
 */
export function FirstVisit() {
  const { values } = useContent();
  const steps = values['shop.steps'];
  if (steps.length === 0) return null;
  return (
    <section className="first-visit" id="first-visit" aria-labelledby="first-visit-title">
      <div className="wrap">
        <header className="section-head">
          <p className="kicker">First time here?</p>
          <h2 className="section-title" id="first-visit-title">
            A visit, start to finish
          </h2>
        </header>
        <ol className="visit-steps__list">
          {steps.map((step, index) => (
            <li className="visit-steps__item" key={`${step.title}-${index}`}>
              <span className="visit-steps__no" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="visit-steps__name">{step.title}</h3>
              {step.text ? <p className="visit-steps__text">{step.text}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
