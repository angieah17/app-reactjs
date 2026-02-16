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
    <section style={{ marginTop: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '0.5rem' }}>ID</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '0.5rem' }}>Username</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '0.5rem' }}>Rol</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '0.5rem' }}>Habilitado</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} style={{ padding: '0.75rem' }}>Cargando usuarios...</td>
            </tr>
          )}

          {!loading && usuarios.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '0.75rem' }}>No hay usuarios para mostrar.</td>
            </tr>
          )}

          {!loading && usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{usuario.id}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{usuario.username}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{getRoleLabel(usuario.role)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{usuario.enabled ? 'Sí' : 'No'}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => onEdit(usuario.id)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => onDelete(usuario.id)}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
          Anterior
        </button>

        {pageButtons.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            disabled={pageNumber === page}
          >
            {pageNumber + 1}
          </button>
        ))}

        <button type="button" onClick={() => onPageChange(page + 1)} disabled={!canNext}>
          Siguiente
        </button>

        <span style={{ marginLeft: '0.5rem' }}>
          Total: {totalElements}
        </span>
      </div>
    </section>
  );
}
