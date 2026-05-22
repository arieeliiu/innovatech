'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { getRoleFromToken } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage('');

      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!data.access_token) {
        setMessage('Credenciales incorrectas');
        return;
      }

      localStorage.setItem('token', data.access_token);

      const role = getRoleFromToken(data.access_token);

      if (role?.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        router.push('/projects');
      }
    } catch {
      localStorage.removeItem('token');
      setMessage('Credenciales incorrectas o error de conexión');
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070A] text-[#F5F7FA]">
      <section className="grid min-h-screen lg:grid-cols-[52%_48%]">
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1F2E49] px-8 py-12">
          <div className="absolute right-0 top-0 h-full w-7 bg-gradient-to-l from-[#00feff]/30 to-transparent blur-md" />

          <section className="relative z-10 w-full max-w-[350px] -translate-y-15">
            <div className="relative mb-10 w-fit -translate-x-23 translate-y-7">

              <img
                src="/innovatech-logo.png"
                alt="Innovatech Solutions"
                className="relative z-10 h-auto w-[490px] max-w-none"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#F5F7FA]">
                Bienvenido
              </h1>

              <p className="mt-3 text-base font-normal tracking-tight text-[#AAB4C0]">
                Accede con tus credenciales para continuar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-9 space-y-6">
              <div>
                <label className="text-xs font-semibold tracking-[0.20em] text-[#F5F7FA]">
                  CORREO ELECTRÓNICO
                </label>

                <input
                  className="mt-3 w-full rounded-lg border border-[#123746] bg-[#162233] px-4 py-3 text-sm text-[#F5F7FA] outline-none transition placeholder:text-[#AAB4C0]/35 focus:border-[#43c3cf] focus:ring-2 focus:ring-[#43c3cf]/20"
                  type="email"
                  placeholder="usuario@innovatech.cl"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-[0.20em] text-[#F5F7FA]">
                  CONTRASEÑA
                </label>

                <div className="relative mt-3">
                  <input
                    className="w-full rounded-lg border border-[#123746] bg-[#162233] px-4 py-3 pr-11 text-sm text-[#F5F7FA] outline-none transition placeholder:text-[#AAB4C0]/35 focus:border-[#43c3cf] focus:ring-2 focus:ring-[#43c3cf]/20"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB4C0] transition hover:text-[#F5F7FA]"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#52e0dc] px-5 py-3 text-sm font-medium tracking-tight text-[#05070A] shadow-[0_10px_22px_rgba(82,224,220,0.12)] transition hover:bg-[#43c3cf]"
                type="submit"
              >
                Iniciar sesión
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </button>
            </form>

            {message && (
              <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {message}
              </div>
            )}
          </section>

          <p className="absolute bottom-10 left-1/2 z-10 w-full -translate-x-1/2 px-8 text-center text-xs tracking-wide text-[#AAB4C0]/35">
            © 2026 Innovatech Solutions · Todos los derechos reservados
          </p>
        </div>

        <div 
          className="relative hidden min-h-screen items-center overflow-hidden border-l border-[#123746]/40 bg-[#171C22] px-20 lg:flex"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 20%, rgba(42, 34, 70, 0.15), transparent 40%), radial-gradient(circle at 85% 75%, rgba(242, 198, 109, 0), transparent 28%)',
          }}
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-[14%] top-[8%] h-1 w-1 rounded-full bg-[#43c3cf]" />
            <div className="absolute left-[34%] top-[16%] h-1 w-1 rounded-full bg-[#123746]" />
            <div className="absolute left-[67%] top-[10%] h-1 w-1 rounded-full bg-[#43c3cf]" />
            <div className="absolute left-[78%] top-[33%] h-1 w-1 rounded-full bg-[#F2C66D]" />
            <div className="absolute left-[49%] top-[58%] h-1 w-1 rounded-full bg-[#AAB4C0]" />
            <div className="absolute left-[88%] top-[79%] h-1 w-1 rounded-full bg-[#43c3cf]" />
            <div className="absolute left-[23%] top-[82%] h-1 w-1 rounded-full bg-[#F2C66D]" />
          </div>

          <section className="relative z-10 max-w-xl translate-x-15">
            <p className="mb-5 text-sm font-medium tracking-[0.15em] text-[#52e0dc]">
              SOFTWARE & TECHNOLOGY CONSULTING
            </p>

            <h2 className="text-6xl font-bold leading-[1.02] tracking-tight text-[#F5F7FA] xl:text-7xl">
              Construimos
              <br />
              el futuro
              <br />
              <span className="text-[#52e0dc]">digital.</span>
            </h2>

            <p className="mt-7 max-w-lg text-lg font-normal leading-8 tracking-tight text-[#AAB4C0]">
              Plataforma de gestión para equipos, proyectos y tareas de
              Innovatech Solutions.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}