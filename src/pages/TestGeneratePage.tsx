import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import testService, { type TestFilters, type TipoPregunta } from '../services/testService'
import { getBackendErrorMessage } from '../services/apiClient'

type TipoPreguntaOption = TipoPregunta | ''

export default function TestGeneratePage() {
  const navigate = useNavigate()
  const [tematica, setTematica] = useState('')
  const [tipoPregunta, setTipoPregunta] = useState<TipoPreguntaOption>('')
  const [limite, setLimite] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <section style={{ padding: '1rem', maxWidth: 680 }}>
      <h1>Generar test</h1>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <label htmlFor="tematica">
          Temática
          <input
            id="tematica"
            type="text"
            value={tematica}
            onChange={(e) => setTematica(e.target.value)}
            placeholder="Ej: Historia"
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>

        <label htmlFor="tipoPregunta">
          Tipo de pregunta
          <select
            id="tipoPregunta"
            value={tipoPregunta}
            onChange={(e) => setTipoPregunta(e.target.value as TipoPreguntaOption)}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            <option value="">Todos</option>
            <option value="VERDADERO_FALSO">Verdadero/Falso</option>
            <option value="UNICA">Única</option>
            <option value="MULTIPLE">Múltiple</option>
          </select>
        </label>

        <label htmlFor="limite">
          Límite de preguntas
          <input
            id="limite"
            type="number"
            min={1}
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
        </label>

        <button type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generando...' : 'Generar y jugar'}
        </button>

        {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}
      </div>
    </section>
  )
}
