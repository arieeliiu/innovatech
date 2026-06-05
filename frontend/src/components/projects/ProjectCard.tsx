import { ProgressBar } from '../ui/ProgressBar';
import type { Project } from '../../types';

type ProjectCardProps = {
  project: Project;
  responsibleName: string;
  onViewDetail: () => void;
};

export function ProjectCard({
  project,
  responsibleName,
  onViewDetail,
}: ProjectCardProps) {
  return (
    <article className="rounded-xl bg-white p-5 shadow transition hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {project.name}
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {project.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        {project.description}
      </p>

      <div className="mt-4">
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-4 text-sm text-slate-700">
        <p>
          <strong>Responsable:</strong> {responsibleName}
        </p>

        <p>
          <strong>Inicio:</strong> {project.start_date}
        </p>

        <p>
          <strong>Término:</strong> {project.end_date}
        </p>
      </div>

      <button
        type="button"
        onClick={onViewDetail}
        className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Ver detalles
      </button>
    </article>
  );
}