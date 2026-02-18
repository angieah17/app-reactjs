import axios from 'axios'
import { useState } from 'react'

export interface ExternalActivity {
  activity: string
  type: string
  participants: number
}

function WelcomePage() {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState<ExternalActivity | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStart = () => {
    const normalizedApiBase = apiBase.trim().replace(/\/+$/, '')
    window.location.href = `${normalizedApiBase}/`
  }

  const handleGetActivity = async () => {
    setLoading(true)
    setError(null)

    try {
      const normalizedApiBase = apiBase.trim().replace(/\/+$/, '')
      const { data } = await axios.get<ExternalActivity>(
        `${normalizedApiBase}/api/external/activity`,
      )
      setActivity(data)
    } catch {
      setActivity(null)
      setError('No se pudo obtener la actividad. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Bienvenido</h1>
      <p>Accede a la plataforma y comienza tu experiencia.</p>

      <button type="button" className="btn btn-primary" onClick={handleStart}>
        Empezar
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleGetActivity}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Obtener actividad'}
      </button>

      {error && <p>{error}</p>}

      {activity && (
        <div>
          <p>Actividad: {activity.activity}</p>
          <p>Tipo: {activity.type}</p>
          <p>Participantes: {activity.participants}</p>
        </div>
      )}
    </section>
  )
}

export default WelcomePage