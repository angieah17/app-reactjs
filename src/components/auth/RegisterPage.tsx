import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
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
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      })

      if (res.ok) {
        // Registro exitoso → redirigir a login
        navigate('/login')
        return
      }

      // intentar leer mensaje de error del backend
      let msg = 'Error en el registro'
      try {
        const json = await res.json()
        msg = json?.message || JSON.stringify(json)
      } catch {
        const text = await res.text()
        if (text) msg = text
      }
      setError(msg)
    } catch (err) {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{maxWidth:480, margin:'2rem auto', padding:20, border:'1px solid #e5e7eb', borderRadius:8}}>
      <h2 style={{marginBottom:12}}>Crear cuenta</h2>

      {error && (
        <div style={{color:'#b91c1c', marginBottom:12}} role="alert">{error}</div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div style={{marginBottom:8}}>
          <label style={{display:'block', marginBottom:6}}>Usuario</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            autoComplete="username"
            style={{width:'100%', padding:8, boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:8}}>
          <label style={{display:'block', marginBottom:6}}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            style={{width:'100%', padding:8, boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block', marginBottom:6}}>Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            style={{width:'100%', padding:8, boxSizing:'border-box'}}
          />
        </div>

        <button type="submit" disabled={isSubmitting} style={{padding:'8px 12px'}}>
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p style={{marginTop:12}}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}
