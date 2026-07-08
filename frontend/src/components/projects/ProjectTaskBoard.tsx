import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';
import type { Task, TaskStatus } from '../../types';
import { formatDateShort } from '../../lib/date';

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
          <h2 className="font-heading text-2xl font-bold text-content-strong">
            Tablero de tareas
          </h2>

          <p className="mt-1 text-content-muted">
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
            <Card
              as="section"
              key={column.status}
              className="flex max-h-[650px] min-h-[420px] flex-col p-4"
            >
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <h3 className="font-heading font-semibold text-content-strong">
                  {column.title}
                </h3>

                <span className="rounded-full border border-theme-border bg-surface-alt px-3 py-1 text-xs font-semibold text-content-strong">
                  {columnTasks.length}
                </span>
              </div>

              <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
                {columnTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-theme-border-strong bg-surface-alt p-4 text-sm text-content-muted">
                    No hay tareas en esta columna.
                  </p>
                )}

                {columnTasks.map((task) => (
                  <Card
                    as="article"
                    variant="subtle"
                    key={task.id}
                    className="p-4"
                  >
                    <h4 className="font-semibold text-content-strong">
                      {task.title}
                    </h4>

                    <p className="mt-2 text-sm text-content-muted">
                      {task.description}
                    </p>

                    <div className="mt-4 space-y-1 text-xs text-content-muted">
                      <p>
                        <strong className="text-content-strong">Inicio:</strong>{' '}
                        {formatDateShort(task.start_date)}
                      </p>

                      <p>
                        <strong className="text-content-strong">
                          Término:
                        </strong>{' '}
                        {formatDateShort(task.end_date)}
                      </p>

                      <p>
                        <strong className="text-content-strong">
                          Responsable:
                        </strong>{' '}
                        {getUserName(task.responsible_id)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={task.progress} />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
