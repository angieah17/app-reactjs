import { useCallback, useEffect, useState } from 'react'
import { getBackendErrorMessage } from '../services/apiClient'
import testLogService, { type TestLog } from '../services/testLogService'

function formatDate(dateValue: string): string {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return date.toLocaleString()
}

function extractErrorMessage(error: unknown): string {
  return getBackendErrorMessage(error, 'No se pudo cargar el historial de notas. Intenta nuevamente.')
}

export default function TestLogHistoryPage() {
  const [logs, setLogs] = useState<TestLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const records = await testLogService.getMyTestLogs()
      setLogs(records)
    } catch (err) {
      setError(extractErrorMessage(err))
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const hasData = logs.length > 0

  return (
    <section className="mx-auto" style={{ maxWidth: 860 }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="mb-0">Historial de notas</h1>
        <button type="button" className="btn btn-secondary" onClick={loadLogs} disabled={loading}>
          {loading ? 'Cargando...' : 'Refrescar'}
        </button>
      </div>

      {loading && <p>Cargando historial de notas...</p>}

      {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}

      {!loading && !error && !hasData && <p>No hay notas registradas.</p>}

      {!loading && !error && hasData && (
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={`${log.fecha}-${index}`}>
                <td>{formatDate(log.fecha)}</td>
                <td>{Number(log.nota).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
