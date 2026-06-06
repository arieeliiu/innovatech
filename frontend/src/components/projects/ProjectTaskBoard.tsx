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
          <h2 className="text-2xl font-bold text-slate-900">
            Tablero de tareas
          </h2>

          <p className="mt-1 text-slate-600">
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
              className="min-h-96 rounded-xl bg-white p-4 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {column.title}
                </h3>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No hay tareas en esta columna.
                  </p>
                )}

                {columnTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <h4 className="font-semibold text-slate-900">
                      {task.title}
                    </h4>

                    <p className="mt-2 text-sm text-slate-600">
                      {task.description}
                    </p>

                    <div className="mt-4 text-xs text-slate-600">
                      <p>
                        <strong>Inicio:</strong> {task.start_date}
                      </p>

                      <p>
                        <strong>Término:</strong> {task.end_date}
                      </p>

                      <p>
                        <strong>Responsable:</strong>{' '}
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