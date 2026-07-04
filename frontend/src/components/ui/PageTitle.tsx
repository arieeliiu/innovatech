import type { HTMLAttributes } from 'react';

type PageTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function PageTitle({ className = '', ...props }: PageTitleProps) {
  return (
    <h1
      className={`font-heading text-[clamp(30px,2.2vw,40px)] font-semibold leading-[0.96] text-content-strong ${className}`}
      {...props}
    />
  );
}
