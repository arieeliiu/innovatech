import type { HTMLAttributes } from 'react';

type PageTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const pageActionButtonClassName =
  'inline-flex min-h-[38px] items-center justify-center rounded-full border border-theme-border-strong bg-surface px-[18px] text-sm font-medium tracking-[0.03em] text-content-strong transition hover:bg-surface-hover';

export const primaryPageActionButtonClassName =
  'inline-flex min-h-[38px] items-center justify-center rounded-full bg-primary px-[18px] text-sm font-medium tracking-[0.03em] text-primary-foreground transition hover:bg-primary-hover active:bg-primary-active';

export function PageTitle({ className = '', ...props }: PageTitleProps) {
  return (
    <h1
      className={`font-heading text-[clamp(30px,2.2vw,40px)] font-semibold leading-[0.96] text-content-strong ${className}`}
      {...props}
    />
  );
}
