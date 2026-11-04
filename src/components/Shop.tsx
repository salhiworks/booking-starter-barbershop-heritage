import { useContent } from '../lib/content';
import { Picture } from './Picture';
import { SectionHead } from './SectionHead';

export function Shop() {
  const { values } = useContent();
  const room = values['shop.photo'];
  const detail = values['shop.detail'];
  const notes = values['shop.notes'];
  const steps = values['shop.steps'];

  return (
    <section className="shop" id="shop" aria-labelledby="shop-title">
      {room ? (
        <div className="shop__room">
          <div className="frame frame--room">
            <Picture image={room} sizes="100vw" />
          </div>
        </div>
      ) : null}
      <div className={`wrap shop__grid${room ? '' : ' shop__grid--no-room'}`}>
        <div className="shop__intro">
          <SectionHead number="05" label="First visit" title={values['shop.title']} titleId="shop-title" lede={values['shop.lede']} />
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
        </div>
        {detail ? (
          <div className="shop__detail">
            <div className="frame frame--portrait">
              <Picture image={detail} sizes="(min-width: 1080px) 510px, (min-width: 720px) 416px, 70vw" />
            </div>
          </div>
        ) : null}
      </div>
      {steps.length > 0 ? (
        <div className="wrap">
          <h3 className="visit-steps__title">
            <span className="eyebrow__rule" aria-hidden="true" />A visit, start to finish
          </h3>
          <ol className="visit-steps">
            {steps.map((step, index) => (
              <li className="visit-steps__item" key={`${step.title}-${index}`}>
                <span className="visit-steps__no" aria-hidden="true">
                  {index + 1}
                </span>
                <h4 className="visit-steps__name">{step.title}</h4>
                {step.text ? <p className="visit-steps__text">{step.text}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
