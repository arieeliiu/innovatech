import { ProgressBar } from '../ui/ProgressBar';
import type { Task, TaskStatus } from '../../types';

type TaskColumn = {
  title: string;
  status: TaskStatus;
};

type ProjectTaskBoardProps = {
  tasks: Task[];
  getUserName: (userId?: string | null) => string;
};

const columns: TaskColumn[] = [
  { title: 'Por hacer', status: 'TODO' },
  { title: 'En progreso', status: 'IN_PROGRESS' },
  { title: 'Finalizadas', status: 'DONE' },
];

export function ProjectTaskBoard({
  tasks,
  getUserName,
}: ProjectTaskBoardProps) {
  return (
    <>
      <div className="mt-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA]">
            Tablero de tareas
          </h2>

          <p className="mt-1 text-[#AAB4C0]">
            Seguimiento de tareas asociadas al proyecto.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <section
              key={column.status}
              className="min-h-96 rounded-2xl border border-[#2A3B55] bg-[#172235] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#F5F7FA]">
                  {column.title}
                </h3>

                <span className="rounded-full border border-[#52E0DC]/30 bg-[#52E0DC]/10 px-3 py-1 text-xs font-semibold text-[#52E0DC]">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 && (
                  <p className="rounded-xl border border-dashed border-[#3A4A63] bg-[#1D2B42] p-4 text-sm text-[#AAB4C0]">
                    No hay tareas en esta columna.
                  </p>
                )}

                {columnTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4"
                  >
                    <h4 className="font-semibold text-[#F5F7FA]">
                      {task.title}
                    </h4>

                    <p className="mt-2 text-sm text-[#AAB4C0]">
                      {task.description}
                    </p>

                    <div className="mt-4 space-y-1 text-xs text-[#AAB4C0]">
                      <p>
                        <strong className="text-[#F5F7FA]">Inicio:</strong>{' '}
                        {task.start_date}
                      </p>

                      <p>
                        <strong className="text-[#F5F7FA]">Término:</strong>{' '}
                        {task.end_date}
                      </p>

                      <p>
                        <strong className="text-[#F5F7FA]">Responsable:</strong>{' '}
                        {getUserName(task.responsible_id)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={task.progress} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}