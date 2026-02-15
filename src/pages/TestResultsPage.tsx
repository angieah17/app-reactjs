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

      <p>Puntuación: {result.puntuacion}</p>
      <p>Total preguntas: {result.totalPreguntas}</p>
      <p>Correctas: {result.preguntasCorrectas}</p>
      <p>Incorrectas: {result.preguntasIncorrectas}</p>
      <p>Porcentaje de acierto: {result.porcentajeAcierto}%</p>

      <h2>Revisión</h2>
      <ul style={{ display: 'grid', gap: '1rem', paddingLeft: '1.25rem' }}>
        {result.revision.map((item) => (
          <li key={item.preguntaId}>
            <strong>{item.enunciado}</strong>
            <p style={{ margin: '0.25rem 0' }}>Tu respuesta: {item.respuestaUsuario}</p>
            <p style={{ margin: '0.25rem 0' }}>Respuesta correcta: {item.respuestaCorrecta}</p>
            <p style={{ margin: '0.25rem 0' }}>Resultado: {item.esCorrecta ? 'Correcta' : 'Incorrecta'}</p>
            {item.explicacion && <p style={{ margin: '0.25rem 0' }}>Explicación: {item.explicacion}</p>}
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => navigate('/tests/generar')}>
        Generar otro test
      </button>
    </section>
  )
}
