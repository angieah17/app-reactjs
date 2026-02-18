import { apiFor } from './apiClient'

const API_PATH = '/api/mongo/logs'
const api = apiFor(API_PATH)

export interface TestLog {
  fecha: string
  nota: number
}

export const saveTestLog = async (nota: number): Promise<void> => {
  await api.post('', null, { params: { nota } })
}

export const getMyTestLogs = async (): Promise<TestLog[]> => {
  const response = await api.get('/me')
  const data = response.data

  if (!Array.isArray(data)) {
    return []
  }

  return data as TestLog[]
}

const testLogService = {
  saveTestLog,
  getMyTestLogs,
}

export default testLogService
