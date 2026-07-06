'use client';

import { useEffect } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

type FeedbackAlertProps = {
  message: string;
  variant?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
};

export function FeedbackAlert({
  message,
  variant = 'success',
  onClose,
  duration = 5000,
}: FeedbackAlertProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = variant === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-6 right-6 z-[70] flex w-[min(400px,calc(100vw-3rem))] items-start gap-3 rounded-[14px] border p-4 shadow-floating backdrop-blur-sm ${
        isSuccess
          ? 'border-success/30 bg-success-surface text-success'
          : 'border-danger/30 bg-danger-surface text-danger'
      }`}
    >
      <span className="mt-0.5 shrink-0">
        {isSuccess ? <CheckCircle2 size={20} /> : <CircleAlert size={20} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {isSuccess ? 'Acción completada' : 'No se pudo completar'}
        </p>
        <p className="mt-0.5 text-sm leading-5 text-content">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X size={16} />
      </button>
    </div>
  );
}
