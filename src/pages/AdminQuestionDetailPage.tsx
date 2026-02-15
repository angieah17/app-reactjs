import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import adminPreguntaService, { type AdminPregunta } from '../services/adminPreguntaService';
import { getBackendErrorMessage } from '../services/apiClient';

export default function AdminQuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [question, setQuestion] = useState<AdminPregunta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setError('ID de pregunta inválido.');
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await adminPreguntaService.getQuestionById(id);
        setQuestion(detail);
      } catch (detailError) {
        setError(getBackendErrorMessage(detailError, 'No se pudo cargar el detalle de la pregunta.'));
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  const showOpciones = question?.tipoPregunta === 'UNICA' || question?.tipoPregunta === 'MULTIPLE';

  return (
    <section style={{ padding: '1rem' }}>
      <h1>Detalle de pregunta</h1>
      <p>
        <Link to="/admin">Volver al listado</Link>
      </p>

      {loading && <p>Cargando detalle...</p>}
      {error && <p style={{ color: '#b00020' }}>{error}</p>}

      {!loading && !error && question && (
        <article style={{ border: '1px solid #ddd', padding: '1rem' }}>
          <p><strong>ID:</strong> {question.id}</p>
          <p><strong>Enunciado:</strong> {question.enunciado}</p>
          <p><strong>Tipo:</strong> {question.tipoPregunta}</p>
          <p><strong>Temática:</strong> {question.tematica}</p>
          <p><strong>Estado:</strong> {question.activa ? 'Activa' : 'Inactiva'}</p>
          <p><strong>Explicación:</strong> {question.explicacion || 'Sin explicación'}</p>

          {question.tipoPregunta === 'VERDADERO_FALSO' && (
            <p>
              <strong>Respuesta correcta:</strong>{' '}
              {question.respuestaCorrecta === true ? 'Verdadero' : 'Falso'}
            </p>
          )}

          {showOpciones && (
            <div>
              <strong>Opciones:</strong>
              <ol>
                {(question.opciones ?? []).map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ol>
            </div>
          )}

          {question.tipoPregunta === 'UNICA' && (
            <p>
              <strong>Índice respuesta correcta:</strong> {typeof question.respuestaCorrecta === 'number' ? question.respuestaCorrecta : '-'}
            </p>
          )}

          {question.tipoPregunta === 'MULTIPLE' && (
            <p>
              <strong>Índices respuestas correctas:</strong>{' '}
              {question.respuestasCorrectas && question.respuestasCorrectas.length > 0
                ? question.respuestasCorrectas.join(', ')
                : '-'}
            </p>
          )}
        </article>
      )}
    </section>
  );
}
