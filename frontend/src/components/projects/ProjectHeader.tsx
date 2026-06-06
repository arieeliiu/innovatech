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
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow transition hover:bg-slate-50"
        >
          Volver a proyectos
        </button>

        {(canFinalizeProject || canDeleteProject) && (
          <div className="flex gap-2">
            {canFinalizeProject && (
              <button
                type="button"
                onClick={onFinalize}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Finalizar proyecto
              </button>
            )}

            {canDeleteProject && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Eliminar proyecto
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {project.name}
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              {project.description}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {project.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Fecha de inicio</p>

            <p className="font-medium text-slate-900">
              {formatDateShort(project.start_date)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Fecha de término</p>

            <p className="font-medium text-slate-900">
              {formatDateShort(project.end_date)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Responsable principal</p>

            <p className="font-medium text-slate-900">{responsibleName}</p>
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