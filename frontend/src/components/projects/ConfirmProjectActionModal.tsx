import type { ReactNode } from 'react';

type ConfirmProjectActionModalProps = {
  title: string;
  description: ReactNode;
  confirmationLabel: string;
  confirmationValue: string;
  error: string;
  isLoading: boolean;
  confirmButtonLabel: string;
  loadingButtonLabel: string;
  variant: 'danger' | 'warning';
  onConfirmationChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmProjectActionModal({
  title,
  description,
  confirmationLabel,
  confirmationValue,
  error,
  isLoading,
  confirmButtonLabel,
  loadingButtonLabel,
  variant,
  onConfirmationChange,
  onCancel,
  onConfirm,
}: ConfirmProjectActionModalProps) {
  const normalizedConfirmation = confirmationValue.trim().toLowerCase();
  const isConfirmed = normalizedConfirmation === confirmationLabel;

  const buttonClasses =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/40'
      : 'border border-amber-400/30 bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-[#171C22] disabled:bg-amber-400/10 disabled:text-amber-300/40';

  const focusBorderClass =
    variant === 'danger' ? 'focus:border-red-400' : 'focus:border-amber-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
        <h2 className="text-xl font-bold text-[#F5F7FA]">{title}</h2>

        <div className="mt-3 text-sm leading-6 text-[#AAB4C0]">
          {description}
        </div>

        <p className="mt-3 text-sm text-[#AAB4C0]">
          Para confirmar, escribe{' '}
          <strong className="text-[#F5F7FA]">{confirmationLabel}</strong>.
        </p>

        <input
          className={`mt-4 w-full rounded-lg border border-[#2A3B55] bg-[#162233] p-2 text-[#F5F7FA] outline-none transition placeholder:text-[#AAB4C0]/60 ${focusBorderClass}`}
          value={confirmationValue}
          onChange={(event) => onConfirmationChange(event.target.value)}
          placeholder={`Escribe ${confirmationLabel}`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-[#162233] px-4 py-2 text-sm font-medium text-[#F5F7FA] transition hover:border-[#52E0DC]/40 hover:bg-[#1D2B42]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || !isConfirmed}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${buttonClasses}`}
          >
            {isLoading ? loadingButtonLabel : confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}