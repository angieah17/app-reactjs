export const AUTH_STORAGE_KEY = 'authData'

export interface AuthStorageData {
  username: string
  credentials: string
  user: any
}

export const encodeCredentials = (username: string, password: string): string => {
  const input = `${username}:${password}`
  const bytes = new TextEncoder().encode(input)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary)
}

export const saveAuthData = (username: string, credentials: string, user: any): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username, credentials, user }))
}

export const getAuthData = (): AuthStorageData | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.credentials || !parsed?.user) return null

    return parsed
  } catch {
    return null
  }
}

export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
