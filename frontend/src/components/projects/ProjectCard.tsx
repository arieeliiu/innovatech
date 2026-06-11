import { ProgressBar } from '../ui/ProgressBar';
import type { Project } from '../../types';

type ProjectCardProps = {
  project: Project;
  responsibleName: string;
  onViewDetail: () => void;
};

function getStatusBadgeClasses(status: string) {
  if (status === 'DONE') {
    return 'border border-[#52E0DC]/30 bg-[#52E0DC]/15 text-[#52E0DC]';
  }

  if (status === 'IN_PROGRESS') {
    return 'border border-amber-400/30 bg-amber-400/15 text-amber-300';
  }

  return 'border border-[#2A3B55] bg-[#162233] text-[#AAB4C0]';
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
}: ProjectCardProps) {
  return (
    <article className="rounded-xl border border-[#2A3B55] bg-[#171C22] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-[#52E0DC]/40">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-[#F5F7FA]">
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

      <p className="mt-2 text-sm text-[#AAB4C0]">{project.description}</p>

      <div className="mt-4">
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-4 rounded-lg bg-[#162233] p-4 text-sm text-[#AAB4C0]">
        <p>
          <strong className="text-[#F5F7FA]">Responsable:</strong>{' '}
          {responsibleName}
        </p>

        <p className="mt-1">
          <strong className="text-[#F5F7FA]">Inicio:</strong>{' '}
          {project.start_date}
        </p>

        <p className="mt-1">
          <strong className="text-[#F5F7FA]">Término:</strong>{' '}
          {project.end_date}
        </p>
      </div>

      <button
        type="button"
        onClick={onViewDetail}
        className="mt-4 w-full rounded-lg bg-[#52E0DC] py-2 text-center text-sm font-semibold text-[#171C22] transition hover:bg-[#43C3CF]"
      >
        Ver detalles
      </button>
    </article>
  );
}