import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if (username.trim().length < 3) {
      return 'El username debe tener al menos 3 caracteres.'
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.'
    }
    return null
  }

  const handleSubmit = async () => {
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await register({ username: username.trim(), password })
      navigate('/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo completar el registro.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto card p-4" style={{ maxWidth: 480 }}>
      <h2 className="mb-3">Crear cuenta</h2>

      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          <input
            className="form-control"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            autoComplete="username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input
            className="form-control"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="mt-3 mb-0">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}
