type ConfirmProjectActionModalProps = {
  title: string;
  description: React.ReactNode;
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
      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
      : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300';

  const focusBorderClass =
    variant === 'danger' ? 'focus:border-red-500' : 'focus:border-amber-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <div className="mt-3 text-sm text-slate-600">{description}</div>

        <p className="mt-3 text-sm text-slate-600">
          Para confirmar, escribe{' '}
          <strong className="text-slate-900">{confirmationLabel}</strong>.
        </p>

        <input
          className={`mt-4 w-full rounded-lg border border-slate-300 p-2 text-slate-900 outline-none ${focusBorderClass}`}
          value={confirmationValue}
          onChange={(event) => onConfirmationChange(event.target.value)}
          placeholder={`Escribe ${confirmationLabel}`}
        />

        {error && (
          <p className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || !isConfirmed}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed ${buttonClasses}`}
          >
            {isLoading ? loadingButtonLabel : confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}