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
    <section className="mx-auto" style={{ maxWidth: 860 }}>
      <h1>Historial de tests</h1>

      {loading && <p>Cargando historial...</p>}

      {!loading && error && (
        <div className="mb-3">
          <div className="alert alert-danger mb-2">{error}</div>
          <button type="button" className="btn btn-secondary" onClick={() => loadHistory(page)}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && !hasData && <p>No hay tests en el historial.</p>}

      {!loading && !error && hasData && (
        <>
          <table className="table table-striped table-hover align-middle mb-3">
            <thead>
              <tr>
                <th>Fecha de realización</th>
                <th>Puntuación</th>
                <th>Temática</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.fechaRealizacion)}</td>
                  <td>{Number(record.puntuacion).toFixed(2)}</td>
                  <td>{record.tematica || 'Sin temática'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              type="button"
              className="btn btn-secondary"
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
              className="btn btn-secondary"
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