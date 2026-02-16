import { useEffect, useState, type FormEvent } from 'react';
import type { UsuarioDTO, UsuarioRole } from '../../services/usuariosService';

export interface UsuarioFormPayload {
  username: string;
  password?: string;
  role: UsuarioRole;
  enabled: boolean;
}

interface UsuarioFormProps {
  mode: 'create' | 'edit';
  initialUsuario?: UsuarioDTO | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: UsuarioFormPayload) => Promise<void>;
  onCancelEdit: () => void;
}

interface FormState {
  username: string;
  password: string;
  role: UsuarioRole;
  enabled: boolean;
}

function getRoleValue(role: string | undefined): UsuarioRole {
  return String(role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
}

function buildInitialState(usuario: UsuarioDTO | null | undefined): FormState {
  return {
    username: usuario?.username ?? '',
    password: '',
    role: getRoleValue(usuario?.role),
    enabled: usuario?.enabled ?? true,
  };
}

export default function UsuarioForm({
  mode,
  initialUsuario,
  submitting,
  error,
  onSubmit,
  onCancelEdit,
}: UsuarioFormProps) {
  const [form, setForm] = useState<FormState>(buildInitialState(initialUsuario));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialState(initialUsuario));
    setLocalError(null);
  }, [initialUsuario, mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username) {
      setLocalError('El username es obligatorio.');
      return;
    }

    if (mode === 'create' && !password) {
      setLocalError('La contraseña es obligatoria para crear.');
      return;
    }

    const payload: UsuarioFormPayload = {
      username,
      role: form.role,
      enabled: form.enabled,
    };

    if (mode === 'create' || password) {
      payload.password = password;
    }

    await onSubmit(payload);

    if (mode === 'create') {
      setForm({
        username: '',
        password: '',
        role: 'USER',
        enabled: true,
      });
    } else {
      setForm((current) => ({ ...current, password: '' }));
    }
  };

  const shownError = localError || error;

  return (
    <section style={{ border: '1px solid #ddd', padding: '1rem' }}>
      <h2>{mode === 'create' ? 'Crear usuario' : 'Editar usuario'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}>
        <label htmlFor="username">
          Username
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>

        <label htmlFor="password">
          Password {mode === 'edit' ? '(opcional)' : '(requerido)'}
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>

        <label htmlFor="role">
          Rol
          <select
            id="role"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UsuarioRole }))}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </label>

        <label htmlFor="enabled" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="enabled"
            type="checkbox"
            checked={form.enabled}
            onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
          />
          Habilitado
        </label>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear usuario'
                : 'Guardar cambios'}
          </button>

          {mode === 'edit' && (
            <button type="button" onClick={onCancelEdit} disabled={submitting}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {shownError && <p style={{ color: '#b00020', marginTop: '0.75rem' }}>{shownError}</p>}
    </section>
  );
}
