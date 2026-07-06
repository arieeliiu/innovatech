'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { changeOwnPassword } from '../lib/api';
import { PasswordInput } from './ui/PasswordInput';
import {
  getUserRoleLabel,
  hasValidPasswordLength,
  USER_PASSWORD_MIN_LENGTH,
} from '../lib/userRules';
import { getDecodedToken } from '../lib/auth';

type LoggedUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

function decodeToken(token: string): LoggedUser | null {
  try {
    const decodedPayload = getDecodedToken(token);

    if (!decodedPayload) return null;

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void Promise.resolve().then(() => {
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
    });
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
  }

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError('');

    if (!hasValidPasswordLength(newPassword)) {
      setPasswordError(
        `La contraseña debe tener al menos ${USER_PASSWORD_MIN_LENGTH} caracteres`,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      setSavingPassword(true);
      await changeOwnPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsProfileOpen(false);
      setNotice('Contraseña actualizada correctamente');
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la contraseña',
      );
    } finally {
      setSavingPassword(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profilePhoto');
    router.push('/');
  }

  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="theme-header-surface border-b border-theme-border px-6 pt-4 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-content">Sesión iniciada</p>
          <p className="font-heading text-2xl font-semibold tracking-tight text-content-strong">
            {user?.name || user?.email || 'Usuario no identificado'}
          </p>
        </div>

        <div className="flex items-center gap-4" ref={menuRef}>
          <div className="flex flex-col items-end gap-1 text-right">
            <p className="text-sm font-medium text-content-strong">
              {user?.email || 'Sin correo'}
            </p>

            <span className="inline-flex rounded-full border border-badge-border bg-badge px-3 py-1 text-xs font-semibold uppercase tracking-wide text-badge-foreground">
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
              className="flex items-center gap-2 rounded-xl bg-profile-button px-2 py-1.5 text-profile-button-foreground transition hover:bg-profile-button-hover"
            >
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt="Foto de perfil"
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-profile-avatar text-sm font-bold text-profile-avatar-foreground">
                  {initial}
                </div>
              )}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.512a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-theme-border bg-surface shadow-floating">
                <div className="border-b border-theme-border px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-content-muted">
                    Mi cuenta
                  </p>
                  <p className="text-sm font-semibold text-content-strong">
                    {user?.name || user?.email || 'Usuario'}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setPasswordError('');
                      setShowPasswordForm(false);
                      setShowPasswords(false);
                      setIsProfileOpen(true);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-content transition hover:bg-surface-hover hover:text-content-strong"
                  >
                    Mi perfil
                  </button>
                </div>

                <div className="border-t border-theme-border p-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg bg-danger px-3 py-2 text-left text-sm font-medium text-danger-foreground transition hover:bg-danger-hover"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notice && <p className="mt-2 text-sm text-content-muted">{notice}</p>}

      {isProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[14px] border border-theme-border bg-surface p-6 text-content shadow-floating">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-content-muted">
                  Cuenta corporativa
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-content-strong">
                  Mi perfil
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                aria-label="Cerrar perfil"
                className="h-9 w-9 border border-theme-border bg-surface-alt text-content-muted transition hover:bg-surface-hover hover:text-content-strong"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-[14px] border border-theme-border bg-surface-alt p-4">
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt="Foto de perfil"
                  width={56}
                  height={56}
                  unoptimized
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-profile-button font-bold text-profile-button-foreground">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-content-strong">
                  {user?.name || 'Usuario'}
                </p>
                <p className="truncate text-sm text-content-muted">
                  {user?.email || 'Sin correo'}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-content-muted">
                  {getUserRoleLabel(user?.role)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border border-theme-border bg-surface-alt px-4 py-2 text-content-strong transition hover:bg-surface-hover"
              >
                Cambiar foto
              </button>
              {profilePhoto && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="border border-theme-border bg-surface-alt px-4 py-2 text-content-strong transition hover:bg-surface-hover"
                >
                  Quitar foto
                </button>
              )}
            </div>

            <p className="mt-5 text-sm text-content-muted">
              El nombre, correo y rol son administrados por la empresa.
            </p>

            {!showPasswordForm ? (
              <button
                type="button"
                onClick={() => {
                  setPasswordError('');
                  setShowPasswordForm(true);
                }}
                className="mt-5 w-full bg-primary px-4 py-2.5 text-primary-foreground transition hover:bg-primary-hover"
              >
                Cambiar contraseña
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-content-strong">
                    Contraseña actual
                  </label>
                  <PasswordInput
                    visible={showPasswords}
                    onVisibleChange={setShowPasswords}
                    wrapperClassName="relative mt-2"
                    inputClassName="w-full rounded-lg border border-theme-border bg-surface-alt p-2.5 pr-12 text-content-strong outline-none focus:border-theme-border-strong"
                    toggleClassName="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-content-muted transition hover:bg-surface-hover hover:text-content-strong"
                    visibilityLabel="contraseña actual"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    minLength={USER_PASSWORD_MIN_LENGTH}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-content-strong">
                    Nueva contraseña
                  </label>
                  <PasswordInput
                    visible={showPasswords}
                    onVisibleChange={setShowPasswords}
                    wrapperClassName="relative mt-2"
                    inputClassName="w-full rounded-lg border border-theme-border bg-surface-alt p-2.5 pr-12 text-content-strong outline-none focus:border-theme-border-strong"
                    toggleClassName="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-content-muted transition hover:bg-surface-hover hover:text-content-strong"
                    visibilityLabel="nueva contraseña"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={USER_PASSWORD_MIN_LENGTH}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-content-strong">
                    Confirmar contraseña
                  </label>
                  <PasswordInput
                    visible={showPasswords}
                    onVisibleChange={setShowPasswords}
                    wrapperClassName="relative mt-2"
                    inputClassName="w-full rounded-lg border border-theme-border bg-surface-alt p-2.5 pr-12 text-content-strong outline-none focus:border-theme-border-strong"
                    toggleClassName="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-content-muted transition hover:bg-surface-hover hover:text-content-strong"
                    visibilityLabel="confirmación de contraseña"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={USER_PASSWORD_MIN_LENGTH}
                  />
                </div>

                {passwordError && (
                  <p className="rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
                    {passwordError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setShowPasswords(false);
                    }}
                    className="border border-theme-border bg-surface-alt px-4 py-2 text-content-strong transition hover:bg-surface-hover"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingPassword ? 'Guardando...' : 'Guardar contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
