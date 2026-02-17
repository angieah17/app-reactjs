import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { TestResultDTO } from '../services/testService'

interface ResultsLocationState {
  result?: TestResultDTO
}

export default function TestResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ResultsLocationState | null) ?? null
  const result = state?.result

  const formattedScore = Number(result?.puntuacion ?? 0).toFixed(2)
  const formattedPercentage = Number(result?.porcentajeAcierto ?? 0).toFixed(2)

  useEffect(() => {
    if (!result) {
      navigate('/tests/generar', { replace: true })
    }
  }, [navigate, result])

  if (!result) {
    return null
  }

  return (
    <section className="mx-auto" style={{ maxWidth: 860 }}>
      <h1>Resultados</h1>

      <div className="card p-3 mb-3">
        <p className="mb-1">Puntuación (0-10): <strong>{formattedScore}</strong></p>
        <p className="mb-1">Porcentaje de acierto: <strong>{formattedPercentage}%</strong></p>
        <p className="mb-1">Preguntas correctas: <strong>{result.preguntasCorrectas}</strong></p>
        <p className="mb-1">Preguntas incorrectas: <strong>{result.preguntasIncorrectas}</strong></p>
        <p className="mb-0">Total de preguntas: <strong>{result.totalPreguntas}</strong></p>
      </div>

      <h2>Revisión</h2>
      <ul className="d-grid gap-3 ps-4">
        {result.revision.map((item) => (
          <li key={item.preguntaId} className="card p-3">
            <p className="mb-2">
              <strong>{item.enunciado}</strong>
            </p>
            <p className="mb-1">Resultado: <strong>{item.esCorrecta ? 'Correcta' : 'Incorrecta'}</strong></p>
            <p className="mb-1">Tu respuesta: {item.respuestaUsuario || 'Sin respuesta'}</p>
            <p className="mb-1">Respuesta correcta: {item.respuestaCorrecta || 'Sin información'}</p>
            <p className="mb-0">Explicación: {item.explicacion || 'Sin explicación disponible.'}</p>
          </li>
        ))}
      </ul>

      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-primary" onClick={() => navigate('/tests/generar')}>
          Nuevo test
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/tests/historial')}>
          Ir a historial
        </button>
      </div>
    </section>
  )
}
