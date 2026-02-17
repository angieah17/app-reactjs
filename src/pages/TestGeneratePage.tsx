import { useState } from 'react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import testService, { type TestFilters, type TipoPregunta } from '../services/testService'
import { getBackendErrorMessage } from '../services/apiClient'

type TipoPreguntaOption = TipoPregunta | ''

export default function TestGeneratePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tematica, setTematica] = useState('')
  const [tipoPregunta, setTipoPregunta] = useState<TipoPreguntaOption>('')
  const [limite, setLimite] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locationState = (location.state as { forbidden?: boolean; message?: string } | null) ?? null
  const [accessMessage, setAccessMessage] = useState<string | null>(
    locationState?.forbidden
      ? locationState.message || 'No tienes permisos para acceder a esa sección.'
      : null,
  )

  useEffect(() => {
    if (!locationState?.forbidden) return
    setAccessMessage(locationState.message || 'No tienes permisos para acceder a esa sección.')
    navigate(location.pathname, { replace: true })
  }, [location.pathname, locationState?.forbidden, locationState?.message, navigate])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const parsedLimit = Number(limite)
      const filters: TestFilters = {
        tematica: tematica.trim() || undefined,
        tipoPregunta: tipoPregunta || undefined,
        limite: Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
      }

      const testData = await testService.generateTest(filters)

      navigate('/tests/play', {
        state: {
          testData,
          filters,
        },
      })
    } catch (err) {
      console.error('Error generando test', err)
      setError(getBackendErrorMessage(err, 'No se pudo generar el test. Intenta nuevamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto" style={{ maxWidth: 680 }}>
      <h1>Generar test</h1>

      <div>
        <div className="mb-3">
          <label htmlFor="tematica" className="form-label">Temática</label>
          <input
            id="tematica"
            type="text"
            className="form-control"
            value={tematica}
            onChange={(e) => setTematica(e.target.value)}
            placeholder="Ej: Historia"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="tipoPregunta" className="form-label">Tipo de pregunta</label>
          <select
            id="tipoPregunta"
            className="form-select"
            value={tipoPregunta}
            onChange={(e) => setTipoPregunta(e.target.value as TipoPreguntaOption)}
          >
            <option value="">Todos</option>
            <option value="VERDADERO_FALSO">Verdadero/Falso</option>
            <option value="UNICA">Única</option>
            <option value="MULTIPLE">Múltiple</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="limite" className="form-label">Límite de preguntas</label>
          <input
            id="limite"
            type="number"
            className="form-control"
            min={1}
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generando...' : 'Generar y jugar'}
        </button>

        {accessMessage && <div className="alert alert-danger mt-3 mb-0">{accessMessage}</div>}
        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
      </div>
    </section>
  )
}
