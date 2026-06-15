'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'innovatech-admin-theme';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const initialTheme = isTheme(savedTheme) ? savedTheme : 'light';

    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="fixed bottom-6 left-6 z-50 grid h-12 w-12 place-items-center rounded-full border border-[var(--system-border)] bg-[var(--system-card)] text-[var(--text)] transition hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
