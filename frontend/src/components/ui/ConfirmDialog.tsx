'use client';

import { TriangleAlert } from 'lucide-react';
import { Card } from './Card';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  loadingLabel = 'Procesando...',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 shadow-floating">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-surface text-danger">
            <TriangleAlert size={21} />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-content-strong">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-content-muted">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-theme-border bg-surface-alt px-4 py-2 text-content-strong transition hover:bg-surface-hover disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-danger px-4 py-2 font-semibold text-danger-foreground transition hover:bg-danger-hover disabled:opacity-50"
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </Card>
    </div>
  );
}
