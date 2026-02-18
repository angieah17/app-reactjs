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
          <div className="d-flex gap-3 mt-2">
            <label className="form-check-label">
              <input
                type="radio"
                className="form-check-input me-1"
                name={`vf-${pregunta.id}`}
                checked={isVFAnswer(answer) && answer.respuestaVF === true}
                onChange={() => setRespuestaVF(pregunta.id, true)}
              />
              Verdadero
            </label>
            <label className="form-check-label">
              <input
                type="radio"
                className="form-check-input me-1"
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
          <div className="d-grid gap-1 mt-2">
            {(pregunta.opciones ?? []).map((opcion, index) => (
              <label key={`${pregunta.id}-${index}`} className="form-check-label">
                <input
                  type="radio"
                  className="form-check-input me-1"
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
          <div className="d-grid gap-1 mt-2">
            {(pregunta.opciones ?? []).map((opcion, index) => (
              <label key={`${pregunta.id}-${index}`} className="form-check-label">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
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
    <section className="mx-auto" style={{ maxWidth: 760 }}>
      <h1>Jugar test</h1>
      <p className="mt-0">Total preguntas: {testData.totalPreguntas}</p>

      {preguntas.length === 0 ? (
        <p>No hay preguntas para los filtros seleccionados.</p>
      ) : (
        <ol className="d-grid gap-3 ps-4">
          {preguntas.map((pregunta) => (
            <li key={pregunta.id}>
              <strong>{pregunta.enunciado}</strong>
              {renderPregunta(pregunta)}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 d-grid gap-2">
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting || preguntas.length === 0}>
          {submitting ? 'Enviando...' : 'Enviar respuestas'}
        </button>

        {error && <div className="alert alert-danger mb-0">{error}</div>}
      </div>
    </section>
  )
}
