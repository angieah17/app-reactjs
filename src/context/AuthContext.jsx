import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const AUTH_STORAGE_KEY = 'authData'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

const AuthContext = createContext(undefined)

const encodeCredentials = (username, password) => {
  const input = `${username}:${password}`
  const bytes = new TextEncoder().encode(input)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary)
}

const saveAuthData = (username, credentials, user) => {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ username, credentials, user }),
  )
}

const getAuthData = () => {
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

const clearAuthData = () => localStorage.removeItem(AUTH_STORAGE_KEY)

const parseAxiosErrorMessage = (error, fallback) => {
  if (!axios.isAxiosError(error)) return fallback
  const data = error.response?.data
  if (typeof data === 'string') return data
  return data?.message || data?.error || error.message || fallback
}

const getCurrentUserRequest = async (credentials) => {
  const response = await apiClient.get('/api/users/me', {
    headers: { Authorization: `Basic ${credentials}` },
  })
  return response.data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearAuthData()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const login = useCallback(async (username, password) => {
    if (!username || !password) {
      throw new Error('Usuario y contraseña son obligatorios.')
    }

    setIsLoading(true)
    try {
      const credentials = encodeCredentials(username, password)
      const currentUser = await getCurrentUserRequest(credentials)

      saveAuthData(username, credentials, currentUser)
      setUser(currentUser)
      setIsAuthenticated(true)

      return currentUser
    } catch (error) {
      clearAuthData()
      setUser(null)
      setIsAuthenticated(false)
      throw new Error(
        parseAxiosErrorMessage(
          error,
          'Credenciales inválidas o sesión no disponible.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData, plainPassword) => {
    const payload =
      typeof userData === 'object' && userData !== null
        ? userData
        : { username: userData, password: plainPassword }

    if (!payload?.username || !payload?.password) {
      throw new Error('Username y password son obligatorios para registrarse.')
    }

    try {
      const response = await apiClient.post('/auth/register', {
        username: payload.username,
        password: payload.password,
      })
      return response.data
    } catch (error) {
      throw new Error(parseAxiosErrorMessage(error, 'No se pudo completar el registro.'))
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      const stored = getAuthData()
      if (!stored?.credentials) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUserRequest(stored.credentials)
        if (!isMounted) return

        saveAuthData(stored.username, stored.credentials, currentUser)
        setUser(currentUser)
        setIsAuthenticated(true)
      } catch {
        if (!isMounted) return
        clearAuthData()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initializeAuth()
    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout, register }),
    [user, isAuthenticated, isLoading, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  return context
}