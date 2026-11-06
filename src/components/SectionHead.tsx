import type { ReactNode } from 'react';

interface SectionHeadProps {
  /** A short mono label above the title — a fact, not a number. Optional. */
  kicker?: string;
  title: string;
  titleId: string;
  lede?: string;
  /** Extra lines beside the lede (honest labels, a button). */
  children?: ReactNode;
  className?: string;
}

/** Poster title on the left; the lede (and anything extra) beside it on wide screens. */
export function SectionHead({ kicker, title, titleId, lede, children, className = '' }: SectionHeadProps) {
  return (
    <header className={`section-head ${className}`}>
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h2 className="section-title" id={titleId}>
        {title}
      </h2>
      {lede || children ? (
        <div className="section-head__side">
          {lede ? <p className="section-lede">{lede}</p> : null}
          {children ? <div className="section-head__extra">{children}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
