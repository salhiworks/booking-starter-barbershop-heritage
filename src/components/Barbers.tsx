import { isDefault, useContent } from '../lib/content';
import { SAMPLE_TOOL_PHOTOS } from '../lib/sample-photos';
import { Picture } from './Picture';
import { SectionHead } from './SectionHead';

const CARD_SIZES = '(min-width: 1080px) 380px, (min-width: 720px) 30vw, 38vw';

export function Barbers() {
  const content = useContent();
  const { values } = content;
  const samples = isDefault(content, 'team.members');
  const members = values['team.members'];

  return (
    <section className="team" id="barbers" aria-labelledby="team-title">
      <div className="wrap">
        <SectionHead number="04" label="Behind the chair" title={values['team.title']} titleId="team-title" lede={values['team.lede']}>
          {samples ? (
            <p className="tag tag--sample">Sample profiles · placeholders until the shop adds its team</p>
          ) : null}
        </SectionHead>
        <ul className="team__list">
          {members.map((member, index) => {
            const portrait = member.photo ?? null;
            const photo = portrait ?? SAMPLE_TOOL_PHOTOS[index % SAMPLE_TOOL_PHOTOS.length];
            return (
              <li className="barber" key={`${member.name}-${index}`}>
                <figure className="barber__figure">
                  <div className="frame frame--card">
                    <Picture image={photo} sizes={CARD_SIZES} />
                  </div>
                  {portrait ? null : <figcaption className="tag tag--photo">Sample photo</figcaption>}
                </figure>
                <div className="barber__body">
                  <h3 className="barber__name">{member.name}</h3>
                  {member.role ? <p className="barber__role">{member.role}</p> : null}
                  {member.bio ? <p className="barber__bio">{member.bio}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
