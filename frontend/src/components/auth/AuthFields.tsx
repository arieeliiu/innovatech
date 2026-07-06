'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { PasswordInput } from '../ui/PasswordInput';

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const fieldClassName =
  'h-[50px] w-full rounded-[15px] border border-theme-border-strong bg-surface px-4 text-sm text-content-strong outline-none ring-4 ring-theme-border/50 transition placeholder:text-content-muted/55';

const labelClassName =
  'font-sans text-[14px] font-semibold tracking-[0.05em] text-content-strong';

export function AuthTextField({ id, label, className = '', ...props }: AuthTextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>

      <input
        id={id}
        className={`mt-3 ${fieldClassName} ${className}`}
        {...props}
      />
    </div>
  );
}

export function AuthPasswordField({ id, label, className = '', ...props }: AuthTextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>

      <PasswordInput
        id={id}
        wrapperClassName="relative mt-3"
        inputClassName={`${fieldClassName} pr-12 ${className}`}
        toggleClassName="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted transition hover:text-content-strong"
        {...props}
      />
    </div>
  );
}

export function AuthSubmitButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`mt-9 flex h-[45px] w-full items-center justify-center rounded-full bg-primary px-5 text-sm text-primary-foreground shadow-[0_16px_36px_rgb(6_12_15_/_0.10)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_18px_42px_rgb(6_12_15_/_0.16)] active:translate-y-0 ${className}`}
      {...props}
    />
  );
}
