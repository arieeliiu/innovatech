import { ProgressBar } from '../ui/ProgressBar';
import { formatDateShort } from '../../lib/date';
import type { Project } from '../../types';

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
    return 'border border-[#52E0DC]/25 bg-[#52E0DC]/10 text-[#7DEBE8]';
  }

  if (status === 'IN_PROGRESS') {
    return 'border border-amber-400/30 bg-amber-400/15 text-amber-300';
  }

  return 'border border-[#3A4A63] bg-[#1D2B42] text-[#C7D0DC]';
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
          className="rounded-lg border border-white/10 bg-[#162233] px-4 py-2 text-sm font-medium text-[#F5F7FA] shadow transition hover:border-[#52E0DC]/40 hover:bg-[#1B2940]"
        >
          Volver a proyectos
        </button>

        {(canFinalizeProject || canDeleteProject) && (
          <div className="flex gap-2">
            {canFinalizeProject && (
              <button
                type="button"
                onClick={onFinalize}
                className="rounded-lg border border-amber-400/30 bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400 hover:text-[#171C22]"
              >
                Finalizar proyecto
              </button>
            )}

            {canDeleteProject && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Eliminar proyecto
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F7FA]">
              {project.name}
            </h1>

            <p className="mt-2 max-w-3xl text-[#AAB4C0]">
              {project.description}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusBadgeClasses(
              project.status,
            )}`}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4">
            <p className="text-sm text-[#AAB4C0]">Fecha de inicio</p>

            <p className="font-medium text-[#F5F7FA]">
              {formatDateShort(project.start_date)}
            </p>
          </div>

          <div className="rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4">
            <p className="text-sm text-[#AAB4C0]">Fecha de término</p>

            <p className="font-medium text-[#F5F7FA]">
              {formatDateShort(project.end_date)}
            </p>
          </div>

          <div className="rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4">
            <p className="text-sm text-[#AAB4C0]">Responsable principal</p>

            <p className="font-medium text-[#F5F7FA]">{responsibleName}</p>
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar
            value={project.progress}
            label="Avance general"
            size="md"
          />
        </div>
      </div>
    </>
  );
}