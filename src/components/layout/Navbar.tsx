import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'


function getUsername(user: any) {
  return user?.username || user?.name || user?.userName || ''
}

function getRoles(user: any): string[] {
  if (!user) return []
  if (Array.isArray(user.roles)) return user.roles.map((r: any) => r?.authority || r?.name || String(r))
  if (user.roles) return [String(user.roles)]
  if (user.role) return [String(user.role)]
  return []
}

export default function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (isLoading) return null
  if (['/', '/login', '/register'].includes(location.pathname)) return null

  const username = getUsername(user)
  const roles = getRoles(user)
  const isAdmin = roles.some((r) => String(r).toUpperCase().includes('ADMIN'))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <nav className="navbar-nav d-flex flex-row flex-wrap gap-2">
          {!isAuthenticated && <Link className="btn btn-outline-light" to="/login">Login</Link>}
          {!isAuthenticated && <Link className="btn btn-outline-light" to="/register">Register</Link>}

          {isAuthenticated && <Link className="btn btn-outline-light" to="/mis-preguntas">Mis Tests</Link>}
          {isAuthenticated && <Link className="btn btn-outline-light" to="/tests/historial">Historial</Link>}
          {isAuthenticated && isAdmin && <Link className="btn btn-outline-light" to="/admin">Admin</Link>}
          {isAuthenticated && isAdmin && <Link className="btn btn-outline-light" to="/admin/preguntas/upload">Subir CSV</Link>}
          {isAuthenticated && isAdmin && <Link className="btn btn-outline-light" to="/admin/usuarios">Admin Usuarios</Link>}
        </nav>

        <div className="d-flex flex-wrap gap-2 align-items-center text-white ms-lg-auto mt-2 mt-lg-0">
          {!isAuthenticated ? (
            <Link className="btn btn-outline-light" to="/login">Login</Link>
          ) : (
            <>
              <span>Bienvenido {username || 'usuario'}</span>
              {roles.length > 0 && <small>({roles.join(', ')})</small>}
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
