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
    <section style={{ padding: '1rem', maxWidth: 860 }}>
      <h1>Resultados</h1>

      <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '1rem' }}>
        <p style={{ margin: 0 }}>Puntuación (0-10): <strong>{formattedScore}</strong></p>
        <p style={{ margin: 0 }}>Porcentaje de acierto: <strong>{formattedPercentage}%</strong></p>
        <p style={{ margin: 0 }}>Preguntas correctas: <strong>{result.preguntasCorrectas}</strong></p>
        <p style={{ margin: 0 }}>Preguntas incorrectas: <strong>{result.preguntasIncorrectas}</strong></p>
        <p style={{ margin: 0 }}>Total de preguntas: <strong>{result.totalPreguntas}</strong></p>
      </div>

      <h2>Revisión</h2>
      <ul style={{ display: 'grid', gap: '1rem', paddingLeft: '1.25rem' }}>
        {result.revision.map((item) => (
          <li key={item.preguntaId} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>{item.enunciado}</strong>
            </p>
            <p style={{ margin: '0.2rem 0' }}>Resultado: <strong>{item.esCorrecta ? 'Correcta' : 'Incorrecta'}</strong></p>
            <p style={{ margin: '0.2rem 0' }}>Tu respuesta: {item.respuestaUsuario || 'Sin respuesta'}</p>
            <p style={{ margin: '0.2rem 0' }}>Respuesta correcta: {item.respuestaCorrecta || 'Sin información'}</p>
            <p style={{ margin: '0.2rem 0' }}>Explicación: {item.explicacion || 'Sin explicación disponible.'}</p>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="button" onClick={() => navigate('/tests/generar')}>
          Nuevo test
        </button>
        <button type="button" onClick={() => navigate('/tests/historial')}>
          Ir a historial
        </button>
      </div>
    </section>
  )
}
