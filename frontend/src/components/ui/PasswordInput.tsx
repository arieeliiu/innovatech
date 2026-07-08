'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  wrapperClassName?: string;
  inputClassName?: string;
  toggleClassName?: string;
  visibilityLabel?: string;
};

export function PasswordInput({
  visible,
  onVisibleChange,
  wrapperClassName = 'relative',
  inputClassName = '',
  toggleClassName = '',
  visibilityLabel = 'contraseña',
  ...inputProps
}: PasswordInputProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = visible ?? internalVisible;

  function toggleVisibility() {
    const nextVisible = !isVisible;
    if (visible === undefined) setInternalVisible(nextVisible);
    onVisibleChange?.(nextVisible);
  }

  return (
    <div className={wrapperClassName}>
      <input
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
        className={inputClassName}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} ${visibilityLabel}`}
        className={toggleClassName}
      >
        {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}
