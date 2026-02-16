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
    <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: '1px solid #ddd'}}>
      <nav style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {!isAuthenticated && <Link to="/register">Register</Link>}

        {isAuthenticated && <Link to="/mis-preguntas">Mis Tests</Link>}
        {isAuthenticated && <Link to="/tests/historial">Historial</Link>}
        {isAuthenticated && isAdmin && <Link to="/admin">Admin</Link>}
        {isAuthenticated && isAdmin && <Link to="/admin/usuarios">Admin Usuarios</Link>}
      </nav>

      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
        {!isAuthenticated ? (
          <Link to="/login"><button>Login</button></Link>
        ) : (
          <>
            <span>Bienvenido {username || 'usuario'}</span>
            {roles.length > 0 && <small style={{marginLeft: 6}}>({roles.join(', ')})</small>}
            <button onClick={handleLogout} style={{marginLeft: 8}}>Logout</button>
          </>
        )}
      </div>
    </header>
  )
}
