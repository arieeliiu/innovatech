'use client';

import { useState } from 'react';
import { createUser } from '../../../../lib/api';
import {
  hasValidPasswordLength,
  USER_PASSWORD_MIN_LENGTH,
  USER_ROLE_OPTIONS,
} from '../../../../lib/userRules';

export default function CreateUserPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CONSULTANT',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage('');
      setError('');

      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (!hasValidPasswordLength(form.password)) {
        setError(
          `La contraseña debe tener al menos ${USER_PASSWORD_MIN_LENGTH} caracteres`,
        );
        return;
      }

      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setMessage('Usuario creado correctamente');

      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CONSULTANT',
      });

      setShowPassword(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'No se pudo crear el usuario',
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Registrar usuario
        </h1>

        <p className="mt-2 text-slate-600">
          Crear una nueva cuenta para Innovatech Solutions.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre
            </label>

            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>

            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 pr-11 text-slate-900 outline-none focus:border-slate-900"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                minLength={USER_PASSWORD_MIN_LENGTH}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.24A10.45 10.45 0 0112 4c5.523 0 10 5 10 8a7.97 7.97 0 01-2.096 4.689M6.61 6.61C3.98 8.24 2 10.97 2 12c0 3 4.477 8 10 8a10.37 10.37 0 004.095-.85"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 pr-11 text-slate-900 outline-none focus:border-slate-900"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({ ...form, confirmPassword: event.target.value })
                }
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.24A10.45 10.45 0 0112 4c5.523 0 10 5 10 8a7.97 7.97 0 01-2.096 4.689M6.61 6.61C3.98 8.24 2 10.97 2 12c0 3 4.477 8 10 8a10.37 10.37 0 004.095-.85"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Rol
            </label>

            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value })
              }
              required
            >
              {USER_ROLE_OPTIONS.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
            >
              Crear usuario
            </button>
          </div>

          {message && <p className="text-green-700">{message}</p>}
          {error && <p className="text-red-700">{error}</p>}
        </form>
      </section>
    </main>
  );
}