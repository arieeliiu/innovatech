import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

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
      ? 'bg-danger text-danger-foreground hover:bg-danger-hover disabled:opacity-40'
      : 'border border-warning/30 bg-warning-surface text-warning hover:border-warning disabled:opacity-40';

  const focusBorderClass =
    variant === 'danger' ? 'focus:border-danger' : 'focus:border-warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 shadow-floating">
        <h2 className="font-heading text-xl font-bold text-content-strong">
          {title}
        </h2>

        <div className="mt-3 max-h-24 min-w-0 overflow-y-auto pr-1 text-sm leading-6 text-content-muted [overflow-wrap:anywhere]">
          {description}
        </div>

        <p className="mt-3 text-sm text-content-muted">
          Para confirmar, escribe{' '}
          <strong className="text-content-strong">{confirmationLabel}</strong>.
        </p>

        <input
          className={`mt-4 w-full rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none transition placeholder:text-content-muted/60 ${focusBorderClass}`}
          value={confirmationValue}
          onChange={(event) => onConfirmationChange(event.target.value)}
          placeholder={`Escribe ${confirmationLabel}`}
        />

        {error && (
          <p className="mt-3 rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-theme-border bg-surface-alt px-4 py-2 text-sm font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
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
      </Card>
    </div>
  );
}
