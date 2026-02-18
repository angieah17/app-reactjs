import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsuarioForm, { type UsuarioFormPayload } from '../components/usuarios/UsuarioForm';
import UsuariosTable from '../components/usuarios/UsuariosTable';
import { getBackendErrorMessage } from '../services/apiClient';
import usuariosService, { type UsuarioDTO } from '../services/usuariosService';

type FormMode = 'create' | 'edit';

const PAGE_SIZE = 10;

function normalizeRole(role: string | undefined): string {
  return String(role || '').toUpperCase();
}

export default function AdminUsuariosPage() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [accessChecking, setAccessChecking] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingUser, setEditingUser] = useState<UsuarioDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUsuarios = async (targetPage: number) => {
    setLoading(true);
    setTableError(null);
    try {
      const response = await usuariosService.listUsuarios({
        page: targetPage,
        size: PAGE_SIZE,
        sort: 'id,desc',
      });

      setUsuarios(response.content ?? []);
      setPage(typeof response.number === 'number' ? response.number : targetPage);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (error) {
      setTableError(getBackendErrorMessage(error, 'No se pudieron cargar los usuarios.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setAccessChecking(true);
      try {
        const me = await usuariosService.getMe();
        const isAdmin = normalizeRole(me.role) === 'ADMIN';

        if (!isAdmin) {
          navigate('/mis-preguntas', {
            replace: true,
            state: {
              forbidden: true,
              message: 'No tienes permisos para acceder al área de administración.',
            },
          });
          return;
        }

        await loadUsuarios(0);
      } catch (error) {
        setTableError(getBackendErrorMessage(error, 'No fue posible validar la sesión.'));
      } finally {
        setAccessChecking(false);
      }
    };

    void initialize();
  }, [navigate]);

  const handleCreateMode = () => {
    setFormMode('create');
    setEditingUser(null);
    setFormError(null);
    setFeedback(null);
  };

  const handleEdit = async (id: number) => {
    setFormError(null);
    setFeedback(null);
    try {
      const usuario = await usuariosService.getUsuario(id);
      setEditingUser(usuario);
      setFormMode('edit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFormError(getBackendErrorMessage(error, 'No se pudo cargar el usuario para edición.'));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este usuario?');
    if (!confirmed) return;

    setFeedback(null);
    setTableError(null);
    try {
      await usuariosService.deleteUsuario(id);
      setFeedback('Usuario eliminado correctamente.');

      const nextPage = usuarios.length === 1 && page > 0 ? page - 1 : page;
      await loadUsuarios(nextPage);
    } catch (error) {
      setTableError(getBackendErrorMessage(error, 'No se pudo eliminar el usuario.'));
    }
  };

  const handleFormSubmit = async (payload: UsuarioFormPayload) => {
    setSubmitting(true);
    setFormError(null);
    setFeedback(null);

    try {
      if (formMode === 'edit' && editingUser) {
        await usuariosService.updateUsuario(editingUser.id, {
          username: payload.username,
          role: payload.role,
          enabled: payload.enabled,
          ...(payload.password ? { password: payload.password } : {}),
        });
        setFeedback('Usuario actualizado correctamente.');
      } else {
        await usuariosService.createUsuario({
          username: payload.username,
          password: payload.password,
          role: payload.role,
          enabled: payload.enabled,
        });
        setFeedback('Usuario creado correctamente.');
      }

      if (formMode === 'edit') {
        handleCreateMode();
      }

      await loadUsuarios(page);
    } catch (error) {
      setFormError(getBackendErrorMessage(error, 'No se pudo guardar el usuario.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 0) return;
    if (totalPages > 0 && nextPage >= totalPages) return;
    await loadUsuarios(nextPage);
  };

  if (accessChecking) {
    return (
      <section>
        <h1>Administración de Usuarios</h1>
        <p>Validando permisos...</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Administración de Usuarios</h1>

      <div className="mb-3">
        <button type="button" className="btn btn-primary" onClick={handleCreateMode} disabled={submitting}>
          Crear usuario
        </button>
      </div>

      <UsuarioForm
        mode={formMode}
        initialUsuario={editingUser}
        submitting={submitting}
        error={formError}
        onSubmit={handleFormSubmit}
        onCancelEdit={handleCreateMode}
      />

      {feedback && <div className="alert alert-success mt-3">{feedback}</div>}
      {tableError && <div className="alert alert-danger mt-3">{tableError}</div>}

      <UsuariosTable
        usuarios={usuarios}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
