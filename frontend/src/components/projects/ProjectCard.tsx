import { Card, CardCirclePattern, type CardPatternPosition } from '../ui/Card';
import type { Project } from '../../types';
import { formatDateShort } from '../../lib/date';

type ProjectCardProps = {
  project: Project;
  responsibleName: string;
  onViewDetail: () => void;
  variant?:
    | 'surface'
    | 'subtle'
    | 'decorativeSoft'
    | 'decorativeStrong';
  patternPosition?: CardPatternPosition;
};

function getStatusBadgeClasses(status: string) {
  if (status === 'DONE') {
    return 'border border-success/30 bg-success-surface text-success';
  }

  if (status === 'IN_PROGRESS') {
    return 'border border-warning/30 bg-warning-surface text-warning';
  }

  return 'border border-info/30 bg-info-surface text-info';
}

function getStatusLabel(status: string) {
  if (status === 'DONE') return 'Finalizado';
  if (status === 'IN_PROGRESS') return 'En progreso';
  if (status === 'TODO') return 'Activo';

  return status;
}

function CircularProgress({ value }: { value: number }) {
  const progress = Math.min(Math.max(Math.round(value ?? 0), 0), 100);
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative h-[88px] w-[88px] shrink-0"
      role="progressbar"
      aria-label="Avance del proyecto"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--theme-border-strong)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-content-strong">
        {progress}%
      </span>
    </div>
  );
}

export function ProjectCard({
  project,
  responsibleName,
  onViewDetail,
  variant = 'surface',
  patternPosition = 'top-left',
}: ProjectCardProps) {
  const isDecorative =
    variant === 'decorativeSoft' || variant === 'decorativeStrong';

  return (
    <Card
      as="article"
      variant={variant}
      interactive
      className="relative isolate overflow-hidden p-5"
    >
      {isDecorative && (
        <CardCirclePattern position={patternPosition} ringTone="light" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 [overflow-wrap:anywhere]">
            <CircularProgress value={project.progress} />

            <div className="min-w-0">
              <h2 className="line-clamp-2 font-heading text-[24px] font-semibold leading-tight text-content-strong [overflow-wrap:anywhere]">
                {project.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-content-muted">
                Avance del proyecto
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${getStatusBadgeClasses(
              project.status,
            )}`}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>

        <p className="mt-5 line-clamp-2 text-sm leading-relaxed text-content-muted [overflow-wrap:anywhere]">
          {project.description}
        </p>

        <div
          className={`mt-4 grid grid-cols-3 gap-4 border-t pt-4 ${
            variant === 'decorativeStrong'
              ? 'border-theme-border-strong'
              : 'border-theme-border'
          }`}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-content-muted">
              Responsable
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-content-strong">
              {responsibleName}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-content-muted">
              Inicio
            </p>
            <p className="mt-1 text-sm font-semibold text-content-strong">
              {formatDateShort(project.start_date)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-content-muted">
              Término
            </p>
            <p className="mt-1 text-sm font-semibold text-content-strong">
              {formatDateShort(project.end_date)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewDetail}
          className="mt-4 inline-flex min-h-[38px] w-full items-center justify-center rounded-full bg-primary px-[18px] text-sm font-medium tracking-[0.03em] text-primary-foreground transition hover:bg-primary-hover active:bg-primary-active"
        >
          Ver detalles
        </button>
      </div>
    </Card>
  );
}
