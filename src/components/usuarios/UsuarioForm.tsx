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
    <section className="card p-3">
      <h2 className="h4">{mode === 'create' ? 'Crear usuario' : 'Editar usuario'}</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            type="text"
            className="form-control"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password {mode === 'edit' ? '(opcional)' : '(requerido)'}</label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Rol</label>
          <select
            id="role"
            className="form-select"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UsuarioRole }))}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>

        <div className="mb-3 form-check">
          <input
            id="enabled"
            type="checkbox"
            className="form-check-input"
            checked={form.enabled}
            onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
          />
          <label htmlFor="enabled" className="form-check-label">Habilitado</label>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear usuario'
                : 'Guardar cambios'}
          </button>

          {mode === 'edit' && (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit} disabled={submitting}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {shownError && <div className="alert alert-danger mt-3 mb-0">{shownError}</div>}
    </section>
  );
}
