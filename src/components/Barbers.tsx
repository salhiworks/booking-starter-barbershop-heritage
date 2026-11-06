import { isDefault, useContent } from '../lib/content';
import { Picture } from './Picture';
import { SectionHead } from './SectionHead';

const CARD_SIZES = '(min-width: 1000px) 420px, (min-width: 720px) 45vw, 38vw';

/**
 * The team. A barber's portrait appears once the owner adds it; until then the
 * profile is words only — never a stand-in photo of someone else, never tools
 * dressed up as a person. The sample profiles say they are samples.
 */
export function Barbers() {
  const content = useContent();
  const { values } = content;
  const samples = isDefault(content, 'team.members');
  const members = values['team.members'];

  return (
    <section className="team" id="barbers" aria-labelledby="team-title">
      <div className="wrap">
        <SectionHead title={values['team.title']} titleId="team-title" lede={values['team.lede']}>
          {samples ? <p className="tag">Sample profiles · placeholders until the shop adds its team</p> : null}
        </SectionHead>
        <ul className="team__list">
          {members.map((member, index) => {
            const portrait = member.photo ?? null;
            return (
              <li className={`barber${portrait ? ' barber--photo' : ''}`} key={`${member.name}-${index}`}>
                {portrait ? (
                  <div className="frame frame--card barber__photo">
                    <Picture image={portrait} sizes={CARD_SIZES} />
                  </div>
                ) : null}
                <h3 className="barber__name">{member.name}</h3>
                {member.role ? <p className="barber__role">{member.role}</p> : null}
                {member.bio ? <p className="barber__bio">{member.bio}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
