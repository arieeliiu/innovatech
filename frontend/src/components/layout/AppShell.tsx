'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import ProfileTopbar from '../ProfileTopbar';
import ThemeLogo from '../ThemeLogo';

export type AppNavigationItem = {
  href: string;
  label: string;
  match: RegExp;
};

export type AppNavigationSection = {
  title?: string;
  items: AppNavigationItem[];
};

type AppShellProps = {
  children: ReactNode;
  homeHref: string;
  navigation: AppNavigationSection[];
};

export function AppShell({ children, homeHref, navigation }: AppShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function getNavItemClass(match: RegExp) {
    return match.test(pathname)
      ? 'block rounded-lg border-l-4 border-nav-active-border bg-nav-active px-3 py-2 text-sm font-semibold text-nav-active-foreground'
      : 'block rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium text-content-muted transition hover:bg-nav-hover hover:text-content-strong';
  }

  return (
    <main className="theme-admin-shell flex h-screen overflow-hidden bg-app text-content">
      <aside className="theme-sidebar-surface relative h-screen w-64 shrink-0 border-r border-theme-border p-6">
        <Link href={homeHref} className="block">
          <ThemeLogo className="w-[190px]" />
        </Link>

        <nav className="mt-8 space-y-5">
          {navigation.map((section, index) => (
            <div
              key={section.title ?? `navigation-${index}`}
              className={
                index > 0
                  ? 'space-y-2 border-t border-theme-border pt-5'
                  : 'space-y-2'
              }
            >
              {section.title && (
                <p className="font-heading text-sm font-semibold leading-[0.96] text-content-strong">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getNavItemClass(item.match)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={() =>
            setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
          }
          className="absolute bottom-6 left-20 flex h-10 w-10 items-center justify-center rounded-full border border-theme-border-strong bg-surface text-content-strong shadow-floating transition hover:-translate-y-0.5 hover:bg-surface-hover"
          aria-label={
            theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
          }
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </aside>

      <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <ProfileTopbar />
        <div className="flex-1 overflow-y-auto px-6 pb-7 pt-10 lg:px-10 lg:pb-8 lg:pt-11">
          <div className="mx-auto w-full max-w-[1450px]">{children}</div>
        </div>
      </section>
    </main>
  );
}
