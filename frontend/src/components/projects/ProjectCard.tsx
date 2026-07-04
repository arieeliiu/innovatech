import { ProgressBar } from '../ui/ProgressBar';
import { Card, CardCirclePattern, type CardPatternPosition } from '../ui/Card';
import type { Project } from '../../types';

type ProjectCardProps = {
  project: Project;
  responsibleName: string;
  onViewDetail: () => void;
  variant?: 'surface' | 'subtle' | 'decorativeSoft';
  patternPosition?: CardPatternPosition;
};

function getStatusBadgeClasses(status: string) {
  if (status === 'DONE') {
    return 'border border-success/30 bg-success-surface text-success';
  }

  if (status === 'IN_PROGRESS') {
    return 'border border-warning/30 bg-warning-surface text-warning';
  }

  return 'border border-theme-border bg-surface-alt text-content-muted';
}

function getStatusLabel(status: string) {
  if (status === 'DONE') return 'Finalizado';
  if (status === 'IN_PROGRESS') return 'En progreso';
  if (status === 'TODO') return 'Pendiente';

  return status;
}

export function ProjectCard({
  project,
  responsibleName,
  onViewDetail,
  variant = 'surface',
  patternPosition = 'top-left',
}: ProjectCardProps) {
  const isDecorative = variant === 'decorativeSoft';

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
          <h2 className="font-heading text-xl font-semibold text-content-strong">
            {project.name}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(
              project.status,
            )}`}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>

        <p className="mt-2 text-sm text-content-muted">{project.description}</p>

        <div className="mt-4">
          <ProgressBar value={project.progress} />
        </div>

        <div
          className={`mt-4 rounded-lg p-4 text-sm text-content-muted ${
            variant === 'decorativeSoft'
              ? 'bg-surface-alt'
              : variant === 'subtle'
                ? 'bg-surface'
                : 'bg-surface-alt'
          }`}
        >
          <p>
            <strong className="text-content-strong">Responsable:</strong>{' '}
            {responsibleName}
          </p>

          <p className="mt-1">
            <strong className="text-content-strong">Inicio:</strong>{' '}
            {project.start_date}
          </p>

          <p className="mt-1">
            <strong className="text-content-strong">Término:</strong>{' '}
            {project.end_date}
          </p>
        </div>

        <button
          type="button"
          onClick={onViewDetail}
          className="mt-4 w-full rounded-lg bg-primary py-2 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Ver detalles
        </button>
      </div>
    </Card>
  );
}
