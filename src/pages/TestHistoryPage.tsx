import { useCallback, useEffect, useState } from 'react'
import { getBackendErrorMessage } from '../services/apiClient'
import testService, { type TestHistorialDTO } from '../services/testService'

const PAGE_SIZE = 10

function formatDate(dateValue: string): string {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return date.toLocaleString()
}

function extractErrorMessage(error: unknown): string {
  return getBackendErrorMessage(error, 'No se pudo cargar el historial. Intenta nuevamente.')
}

export default function TestHistoryPage() {
  const [records, setRecords] = useState<TestHistorialDTO[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await testService.getTestHistory(targetPage, PAGE_SIZE)
      setRecords(Array.isArray(data.content) ? data.content : [])
      setPage(typeof data.number === 'number' ? data.number : targetPage)
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 0)
    } catch (err) {
      setError(extractErrorMessage(err))
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory(0)
  }, [loadHistory])

  const hasData = records.length > 0
  const isFirstPage = page <= 0
  const isLastPage = totalPages > 0 ? page >= totalPages - 1 : !hasData

  return (
    <section style={{ padding: '1rem', maxWidth: 860 }}>
      <h1>Historial de tests</h1>

      {loading && <p>Cargando historial...</p>}

      {!loading && error && (
        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
          <p style={{ color: 'crimson', margin: 0 }}>{error}</p>
          <button type="button" onClick={() => loadHistory(page)}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && !hasData && <p>No hay tests en el historial.</p>}

      {!loading && !error && hasData && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Fecha de realización</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Puntuación</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Temática</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{formatDate(record.fechaRealizacion)}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{Number(record.puntuacion).toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{record.tematica || 'Sin temática'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => loadHistory(page - 1)}
              disabled={loading || isFirstPage}
            >
              Anterior
            </button>

            <span>
              Página {page + 1}
              {totalPages > 0 ? ` de ${totalPages}` : ''}
            </span>

            <button
              type="button"
              onClick={() => loadHistory(page + 1)}
              disabled={loading || isLastPage}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  )
}