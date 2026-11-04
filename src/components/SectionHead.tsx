import type { ReactNode } from 'react';

interface SectionHeadProps {
  /** Printed-menu numbering: "02". */
  number: string;
  /** Small caps signage label beside the number. */
  label: string;
  title: string;
  titleId: string;
  lede?: string;
  children?: ReactNode;
  className?: string;
}

export function SectionHead({ number, label, title, titleId, lede, children, className = '' }: SectionHeadProps) {
  return (
    <header className={`section-head ${className}`}>
      <p className="eyebrow">
        <span className="eyebrow__no">No. {number}</span>
        <span className="eyebrow__rule" aria-hidden="true" />
        <span className="eyebrow__label">{label}</span>
      </p>
      <h2 className="section-title" id={titleId}>
        {title}
      </h2>
      {lede ? <p className="section-lede">{lede}</p> : null}
      {children}
    </header>
  );
}
