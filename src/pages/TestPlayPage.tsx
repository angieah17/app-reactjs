import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBackendErrorMessage } from '../services/apiClient'
import testService, {
  type RespuestaDTO,
  type TestFilters,
  type TestPlayDTO,
  type TestPreguntaDTO,
  type TipoPregunta,
} from '../services/testService'

interface PlayLocationState {
  testData?: TestPlayDTO
  filters?: TestFilters
}

function isVFAnswer(answer: RespuestaDTO | undefined): answer is Extract<RespuestaDTO, { respuestaVF: boolean }> {
  return Boolean(answer && 'respuestaVF' in answer)
}

function isUnicaAnswer(answer: RespuestaDTO | undefined): answer is Extract<RespuestaDTO, { respuestaUnica: number }> {
  return Boolean(answer && 'respuestaUnica' in answer)
}

function isMultipleAnswer(answer: RespuestaDTO | undefined): answer is Extract<RespuestaDTO, { respuestaMultiple: number[] }> {
  return Boolean(answer && 'respuestaMultiple' in answer)
}

export default function TestPlayPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as PlayLocationState | null) ?? null

  const testData = state?.testData
  const filters = state?.filters ?? {}

  const [respuestas, setRespuestas] = useState<Record<number, RespuestaDTO>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!testData) {
      navigate('/tests/generar', { replace: true })
    }
  }, [navigate, testData])

  const preguntas = useMemo(() => testData?.preguntas ?? [], [testData])

  if (!testData) {
    return null
  }

  const setRespuestaVF = (preguntaId: number, value: boolean) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: { respuestaVF: value },
    }))
  }

  const setRespuestaUnica = (preguntaId: number, index: number) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: { respuestaUnica: index },
    }))
  }

  const toggleRespuestaMultiple = (preguntaId: number, index: number) => {
    setRespuestas((prev) => {
      const current = prev[preguntaId]
      const selected = isMultipleAnswer(current) ? current.respuestaMultiple : []
      const next = selected.includes(index)
        ? selected.filter((i) => i !== index)
        : [...selected, index].sort((a, b) => a - b)

      return {
        ...prev,
        [preguntaId]: { respuestaMultiple: next },
      }
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const result = await testService.submitTest(respuestas, {
        tematica: filters.tematica,
        tipoPregunta: filters.tipoPregunta as TipoPregunta | undefined,
      })

      navigate('/tests/resultados', {
        state: { result },
      })
    } catch (err) {
      console.error('Error enviando test', err)
      setError(getBackendErrorMessage(err, 'No se pudo enviar el test. Intenta nuevamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderPregunta = (pregunta: TestPreguntaDTO) => {
    const answer = respuestas[pregunta.id]

    switch (pregunta.tipoPregunta) {
      case 'VERDADERO_FALSO':
        return (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <label>
              <input
                type="radio"
                name={`vf-${pregunta.id}`}
                checked={isVFAnswer(answer) && answer.respuestaVF === true}
                onChange={() => setRespuestaVF(pregunta.id, true)}
              />
              Verdadero
            </label>
            <label>
              <input
                type="radio"
                name={`vf-${pregunta.id}`}
                checked={isVFAnswer(answer) && answer.respuestaVF === false}
                onChange={() => setRespuestaVF(pregunta.id, false)}
              />
              Falso
            </label>
          </div>
        )

      case 'UNICA':
        return (
          <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.5rem' }}>
            {(pregunta.opciones ?? []).map((opcion, index) => (
              <label key={`${pregunta.id}-${index}`}>
                <input
                  type="radio"
                  name={`unica-${pregunta.id}`}
                  checked={isUnicaAnswer(answer) && answer.respuestaUnica === index}
                  onChange={() => setRespuestaUnica(pregunta.id, index)}
                />
                {opcion}
              </label>
            ))}
          </div>
        )

      case 'MULTIPLE':
        return (
          <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.5rem' }}>
            {(pregunta.opciones ?? []).map((opcion, index) => (
              <label key={`${pregunta.id}-${index}`}>
                <input
                  type="checkbox"
                  checked={isMultipleAnswer(answer) && answer.respuestaMultiple.includes(index)}
                  onChange={() => toggleRespuestaMultiple(pregunta.id, index)}
                />
                {opcion}
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section style={{ padding: '1rem', maxWidth: 760 }}>
      <h1>Jugar test</h1>
      <p style={{ marginTop: 0 }}>Total preguntas: {testData.totalPreguntas}</p>

      {preguntas.length === 0 ? (
        <p>No hay preguntas para los filtros seleccionados.</p>
      ) : (
        <ol style={{ display: 'grid', gap: '1rem', paddingLeft: '1.25rem' }}>
          {preguntas.map((pregunta) => (
            <li key={pregunta.id}>
              <strong>{pregunta.enunciado}</strong>
              {renderPregunta(pregunta)}
            </li>
          ))}
        </ol>
      )}

      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
        <button type="button" onClick={handleSubmit} disabled={submitting || preguntas.length === 0}>
          {submitting ? 'Enviando...' : 'Enviar respuestas'}
        </button>

        {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}
      </div>
    </section>
  )
}
