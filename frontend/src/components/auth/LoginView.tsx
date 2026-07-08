'use client';

import {
  useEffect,
  useState,
  type ChangeEventHandler,
  type FormEventHandler,
} from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  AuthPasswordField,
  AuthSubmitButton,
  AuthTextField,
} from './AuthFields';
import LoginMeshBackground from './LoginMeshBackground';
import ThemeLogo from '../ThemeLogo';

type LoginViewProps = {
  variant?: 'light' | 'dark';
  showThemeToggle?: boolean;
  email?: string;
  password?: string;
  message?: string;
  onEmailChange?: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange?: ChangeEventHandler<HTMLInputElement>;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export default function LoginView({
  variant = 'light',
  showThemeToggle = false,
  email,
  password,
  message,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginViewProps) {
  const [previewVariant, setPreviewVariant] = useState<'light' | 'dark'>(variant);
  const currentVariant = showThemeToggle ? previewVariant : variant;
  const isDark = currentVariant === 'dark';
  const variantClassName = isDark ? 'theme-login-dark' : '';

  useEffect(() => {
    if (!showThemeToggle) return;

    const timeout = window.setTimeout(() => {
      setPreviewVariant(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [showThemeToggle]);

  useEffect(() => {
    if (!showThemeToggle) return;

    localStorage.setItem('theme', currentVariant);
    document.documentElement.dataset.theme = currentVariant;
  }, [currentVariant, showThemeToggle]);

  return (
    <main className={`${variantClassName} min-h-screen overflow-hidden bg-app text-content`}>
      {showThemeToggle && (
        <button
          type="button"
          onClick={() => setPreviewVariant((current) => (current === 'dark' ? 'light' : 'dark'))}
          className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-theme-border-strong bg-surface text-content-strong shadow-floating transition hover:-translate-y-0.5 hover:bg-surface-hover"
          aria-label={isDark ? 'Ver modo claro' : 'Ver modo oscuro'}
          title={isDark ? 'Ver modo claro' : 'Ver modo oscuro'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      <section className="grid min-h-screen lg:grid-cols-2">
        <section className="theme-login-panel relative flex min-h-screen items-center justify-center overflow-hidden border-r border-theme-border px-8 py-12">
          <section className="relative z-10 w-full max-w-[330px] -translate-y-6">
            <div className="mb-12 -ml-3">
              <ThemeLogo className="w-[350px]" />
            </div>

            <div>
              <h1 className="font-heading text-[23px] font-semibold leading-[0.96] tracking-[-0.005em] text-content-strong">
                Bienvenido
              </h1>

              <p className="mt-4 text-[15px] leading-6 text-content-muted">
                Accede con tus credenciales para continuar.
              </p>
            </div>

            <form
              className="mt-9 space-y-6"
              onSubmit={onSubmit ?? ((event) => event.preventDefault())}
            >
              <AuthTextField
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="usuario@innovatech.cl"
                value={email}
                onChange={onEmailChange}
                required
              />

              <AuthPasswordField
                id="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={onPasswordChange}
                required
              />

              <AuthSubmitButton type="submit">Iniciar sesión</AuthSubmitButton>
            </form>

            {message && (
              <div className="mt-5 rounded-[15px] border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger">
                {message}
              </div>
            )}
          </section>

          <p className="absolute bottom-8 left-1/2 z-10 w-full -translate-x-1/2 px-8 text-center text-xs tracking-wide text-content-muted/60">
            © 2026 Innovatech Solutions · Todos los derechos reservados
          </p>
        </section>

        <section className="theme-login-hero relative hidden min-h-screen items-center overflow-hidden px-20 lg:flex">
          <LoginMeshBackground key={currentVariant} />

          <div className="theme-login-hero-vignette pointer-events-none absolute inset-0 z-[2]" />

          <section className="relative z-10 max-w-[660px] pl-[40px]">
            <p className="mb-6 ml-2 font-mono text-[15px] uppercase tracking-[0.25em] text-[var(--theme-login-hero-text)]">
              Software & Technology Consulting
            </p>

            <h2 className="font-heading text-[clamp(58px,6.2vw,96px)] leading-[0.92] tracking-[-0.035em] text-[var(--theme-login-hero-text)]">
              Construimos
              <br />
              el futuro
              <br />
              <span className="font-semibold text-[var(--theme-login-hero-text)]">
                digital.
              </span>
            </h2>

            <p className="mt-11 ml-2 max-w-[540px] text-[18px] leading-[1.65] text-[var(--theme-login-hero-muted)]">
              Espacio de trabajo de Innovatech Solutions para
              <br />
              la gestión interna de proyectos y recursos.
            </p>
          </section>
        </section>
      </section>
    </main>
  );
}
