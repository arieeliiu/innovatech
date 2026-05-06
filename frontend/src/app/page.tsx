'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { getRoleFromToken } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      if (role === 'admin') {
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-slate-900">
          Innovatech Solutions
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Ingresa tus credenciales para acceder al sistema.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Correo
            </label>

            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Contraseña
            </label>

            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Iniciar sesión
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
      </section>
    </main>
  );
}