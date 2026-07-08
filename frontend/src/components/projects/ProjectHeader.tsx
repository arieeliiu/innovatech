import { ProgressBar } from '../ui/ProgressBar';
import { formatDateShort } from '../../lib/date';
import type { Project } from '../../types';
import { Card } from '../ui/Card';
import { PageTitle } from '../ui/PageTitle';

type ProjectHeaderProps = {
  project: Project;
  responsibleName: string;
  canFinalizeProject: boolean;
  canDeleteProject: boolean;
  onBack: () => void;
  onFinalize: () => void;
  onDelete: () => void;
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

export function ProjectHeader({
  project,
  responsibleName,
  canFinalizeProject,
  canDeleteProject,
  onBack,
  onFinalize,
  onDelete,
}: ProjectHeaderProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-theme-border bg-surface px-4 py-2 text-sm font-medium text-content-strong shadow transition hover:border-theme-border-strong hover:bg-surface-hover"
        >
          Volver a proyectos
        </button>

        {(canFinalizeProject || canDeleteProject) && (
          <div className="flex gap-2">
            {canFinalizeProject && (
              <button
                type="button"
                onClick={onFinalize}
                className="rounded-lg border border-warning/30 bg-warning-surface px-4 py-2 text-sm font-semibold text-warning transition hover:border-warning"
              >
                Finalizar proyecto
              </button>
            )}

            {canDeleteProject && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-danger-foreground transition hover:bg-danger-hover"
              >
                Eliminar proyecto
              </button>
            )}
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="min-w-0 [overflow-wrap:anywhere]">
            <PageTitle className="line-clamp-2 [overflow-wrap:anywhere]">
              {project.name}
            </PageTitle>

            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-content-muted">
              {project.description}
            </p>
          </div>

          <span
            className={`w-fit shrink-0 rounded-full px-4 py-2 text-sm font-medium ${getStatusBadgeClasses(
              project.status,
            )}`}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card variant="subtle" className="p-4">
            <p className="text-sm text-content-muted">Fecha de inicio</p>

            <p className="font-medium text-content-strong">
              {formatDateShort(project.start_date)}
            </p>
          </Card>

          <Card variant="subtle" className="p-4">
            <p className="text-sm text-content-muted">Fecha de término</p>

            <p className="font-medium text-content-strong">
              {formatDateShort(project.end_date)}
            </p>
          </Card>

          <Card variant="subtle" className="p-4">
            <p className="text-sm text-content-muted">Responsable principal</p>

            <p className="font-medium text-content-strong">{responsibleName}</p>
          </Card>
        </div>

        <div className="mt-6">
          <ProgressBar
            value={project.progress}
            label="Avance general"
            size="md"
          />
        </div>
      </Card>
    </>
  );
}
