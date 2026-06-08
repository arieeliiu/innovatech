'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRoleLabel } from '../lib/userRules';

type LoggedUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

function decodeToken(token: string): LoggedUser | null {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));

    return {
      id: decodedPayload.id || decodedPayload.sub,
      name: decodedPayload.name || decodedPayload.user_metadata?.name,
      email: decodedPayload.email,
      role: decodedPayload.user_metadata?.role || decodedPayload.role,
    };
  } catch {
    return null;
  }
}

export default function ProfileTopbar() {
  const router = useRouter();
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || token === 'undefined' || token === 'null') {
      setUser(null);
      return;
    }

    setUser(decodeToken(token));

    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timeout = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(timeout);
  }, [notice]);

  function handleUploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;

      if (!result) {
        setNotice('No se pudo cargar la imagen');
        return;
      }

      localStorage.setItem('profilePhoto', result);
      setProfilePhoto(result);
      setNotice('Foto de perfil actualizada');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function removePhoto() {
    localStorage.removeItem('profilePhoto');
    setProfilePhoto(null);
    setNotice('Foto de perfil eliminada');
    setIsMenuOpen(false);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profilePhoto');
    router.push('/');
  }

  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="border-b border-white/10 bg-[#162233] px-6 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#AAB4C0]">Sesión iniciada</p>
          <p className="text-2xl font-semibold tracking-tight text-[#F5F7FA]">
            {user?.name || user?.email || 'Usuario no identificado'}
          </p>
        </div>

        <div className="flex items-center gap-4" ref={menuRef}>
          <div className="text-right">
            <p className="text-sm font-medium text-[#F5F7FA]">
              {user?.email || 'Sin correo'}
            </p>

            <span className="inline-flex rounded-full border border-[#52E0DC]/30 bg-[#52E0DC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#52E0DC]">
              {getUserRoleLabel(user?.role)}
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadPhoto}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#162233] px-2 py-1 shadow-sm transition hover:border-white/30"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#52E0DC] text-sm font-bold text-[#171C22]">
                  {initial}
                </div>
              )}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-[#AAB4C0]"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.512a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#171C22] shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[#AAB4C0]">
                    Mi cuenta
                  </p>
                  <p className="text-sm font-semibold text-[#F5F7FA]">
                    {user?.name || user?.email || 'Usuario'}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotice('Perfil disponible pronto');
                      setIsMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#AAB4C0]  hover:bg-[#162233]"
                  >
                    Perfil
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNotice('Configuraciones disponibles pronto');
                      setIsMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#AAB4C0]  hover:bg-[#162233]"
                  >
                    Configuraciones
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNotice('Cambio de contraseña disponible pronto');
                      setIsMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#AAB4C0]  hover:bg-slate-100"
                  >
                    Cambiar contraseña
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#AAB4C0] hover:bg-[#162233]"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-left text-sm font-medium text-white hover:bg-red-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notice && (
        <p className="mt-2 text-sm text-[#AAB4C0]">{notice}</p>
      )}
    </header>
  );
}