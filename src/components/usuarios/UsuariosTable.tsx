import type { UsuarioDTO } from '../../services/usuariosService';

interface UsuariosTableProps {
  usuarios: UsuarioDTO[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

function getRoleLabel(role: string): string {
  return String(role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
}

export default function UsuariosTable({
  usuarios,
  loading,
  page,
  totalPages,
  totalElements,
  onEdit,
  onDelete,
  onPageChange,
}: UsuariosTableProps) {
  const canPrev = page > 0;
  const canNext = totalPages > 0 && page < totalPages - 1;
  const pageButtons = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <section className="mt-3">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Habilitado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5}>Cargando usuarios...</td>
            </tr>
          )}

          {!loading && usuarios.length === 0 && (
            <tr>
              <td colSpan={5}>No hay usuarios para mostrar.</td>
            </tr>
          )}

          {!loading && usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.username}</td>
              <td>{getRoleLabel(usuario.role)}</td>
              <td>{usuario.enabled ? 'Sí' : 'No'}</td>
              <td>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-warning btn-sm" onClick={() => onEdit(usuario.id)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(usuario.id)}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
          Anterior
        </button>

        {pageButtons.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onPageChange(pageNumber)}
            disabled={pageNumber === page}
          >
            {pageNumber + 1}
          </button>
        ))}

        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onPageChange(page + 1)} disabled={!canNext}>
          Siguiente
        </button>

        <span className="ms-1">
          Total: {totalElements}
        </span>
      </div>
    </section>
  );
}
