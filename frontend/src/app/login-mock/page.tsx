'use client';

import { Sun } from 'lucide-react';
import {
  AuthPasswordField,
  AuthSubmitButton,
  AuthTextField,
} from '../../components/auth/AuthFields';
import LoginMeshBackground from '../../components/auth/LoginMeshBackground';
import ThemeLogo from '../../components/ThemeLogo';

export default function LoginMockPage() {
  return (
    <main className="theme-login-concept relative min-h-screen overflow-hidden text-content">
      <div className="absolute inset-0 z-0" />

      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [--theme-login-mesh-active-dot-rgb:249_251_251] [--theme-login-mesh-dot-base-opacity:0.24] [--theme-login-mesh-dot-glow-opacity:0.24] [--theme-login-mesh-dot-rgb:210_218_220] [--theme-login-mesh-line-base-opacity:0.13] [--theme-login-mesh-line-glow-opacity:0.12] [--theme-login-mesh-line-rgb:210_218_220]">
        <LoginMeshBackground />
      </div>

      <button
        type="button"
        className="absolute right-7 top-7 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0D0D0F] text-[var(--rs-50)] shadow-floating transition hover:-translate-y-0.5"
        aria-label="Cambiar modo"
        title="Cambiar modo"
      >
        <Sun size={18} />
      </button>

      <section className="relative z-10 grid min-h-screen px-10 py-12 lg:grid-cols-[43%_57%] lg:px-16">
        <section className="flex min-h-screen items-center justify-center lg:items-start lg:justify-end lg:pt-[12vh] lg:pr-[17vw]">
          <div className="w-full max-w-[250px]">
            <div className="mb-7 -ml-2">
              <ThemeLogo className="w-[265px]" />
            </div>

            <div>
              <h1 className="font-heading text-[20px] font-semibold leading-none text-content-strong">
                Bienvenido
              </h1>

              <p className="mt-3 text-[12px] leading-5 text-content-muted">
                Accede con tus credenciales para continuar.
              </p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={(event) => event.preventDefault()}>
              <AuthTextField
                id="mock-email"
                label="Correo electrónico"
                type="email"
                placeholder="usuario@innovatech.cl"
              />

              <AuthPasswordField
                id="mock-password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
              />

              <AuthSubmitButton type="submit">Iniciar sesión</AuthSubmitButton>
            </form>
          </div>

          <p className="absolute bottom-9 left-1/2 w-full -translate-x-1/2 px-8 text-center text-[10px] tracking-wide text-content-muted/70 lg:left-[22%] lg:w-auto">
            © 2026 Innovatech Solutions · Todos los derechos reservados
          </p>
        </section>

        <section className="hidden min-h-screen items-start justify-start lg:flex lg:pt-[28vh]">
          <div className="max-w-[345px] translate-x-[29vw]">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.38em] text-[var(--rs-950)]">
              Software & Technology Consulting
            </p>

            <h2 className="font-heading text-[clamp(40px,3.7vw,57px)] font-semibold leading-[0.9] tracking-[-0.02em] text-[var(--rs-950)]">
              Construimos
              <br />
              el futuro
              <br />
              digital.
            </h2>

            <p className="mt-7 max-w-[330px] text-[15px] leading-[1.55] text-[var(--rs-950)]">
              Espacio de trabajo de Innovatech Solutions para
              <br />
              la gestión interna de proyectos y recursos.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
