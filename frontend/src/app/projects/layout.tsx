import Link from 'next/link';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Innovatech Solutions
          </h2>

          <nav className="mt-8 flex flex-col gap-4">
            <Link
              href="/projects"
              className="text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              Proyectos
            </Link>

            <Link
              href="/projects/create"
              className="text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              Crear proyecto
            </Link>

            <Link
              href="/projects/tasks"
              className="text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              Tareas
            </Link>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          {children}
        </section>
      </div>
    </main>
  );
}