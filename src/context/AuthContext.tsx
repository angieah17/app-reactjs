import axios from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  clearAuthData,
  encodeCredentials,
  getAuthData,
  saveAuthData,
} from '../utils/authUtils'
import { apiRoot } from '../services/apiClient'

type AuthUser = any

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => void
  register: (userData: any, password?: string) => Promise<any>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const parseAxiosErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback //si no es un error de Axios, devuelve el mensaje de error original o el mensaje de fallback.
  const data = error.response?.data
  if (typeof data === 'string') return data //si la respuesta es un string, se asume que es el mensaje de error.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = error as any
  return data?.message || data?.error || anyErr.message || fallback
}

// Función para obtener los datos del usuario actual desde el backend usando las credenciales codificadas. 
// Si la solicitud es exitosa, devuelve los datos del usuario; de lo contrario, lanza un error.
const getCurrentUserRequest = async (credentials: string): Promise<any> => {
  const response = await apiRoot.get('/auth/me', {
    headers: { Authorization: `Basic ${credentials}` }, // Se envían las credenciales codificadas en el encabezado Authorization usando el esquema Basic 64 que está esperando Spring Security.
  })
  return response.data
}

// Componente proveedor de autenticación que maneja el estado de autenticación, las funciones de inicio de sesión, cierre de sesión y registro, y proporciona estos valores a través del contexto a los componentes hijos.
export function AuthProvider({ children }: { children?: ReactNode }): ReactNode {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  //en el cierre de sesión, se limpian los datos de autenticación, se establece el usuario en null y se marca como no autenticado.
  const logout = useCallback((): void => {
    clearAuthData()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  // Función de inicio de sesión que valida las credenciales, realiza la solicitud al backend para obtener los datos del usuario, y maneja el estado de autenticación en consecuencia. Si las credenciales son inválidas o hay un error en la solicitud, se limpian los datos de autenticación y se lanza un error con un mensaje descriptivo.
  const login = useCallback(async (username: string, password: string): Promise<AuthUser> => {
    if (!username || !password) {
      throw new Error('Usuario y contraseña son obligatorios.')
    }

    setIsLoading(true)
    try {
      const credentials = encodeCredentials(username, password) // Se codifican las credenciales antes de enviarlas al backend.
      const currentUser = await getCurrentUserRequest(credentials) //se guarda la sesión local con el nombre de usuario, las credenciales codificadas y los datos del usuario actual.

      saveAuthData(username, credentials, currentUser) // Se guarda la sesión local con el nombre de usuario, las credenciales codificadas y los datos del usuario actual.
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

  const register = useCallback(async (userData: any, plainPassword?: string): Promise<any> => { // Permite registrar un nuevo usuario. Acepta un objeto con los datos del usuario o un nombre de usuario y contraseña separados. Valida que se proporcionen ambos campos, realiza la solicitud al backend para registrar al usuario, y maneja cualquier error que pueda ocurrir durante el proceso.
    const payload =
      typeof userData === 'object' && userData !== null
        ? userData
        : { username: userData, password: plainPassword }

    if (!payload?.username || !payload?.password) {
      throw new Error('Username y password son obligatorios para registrarse.')
    }

    try {
      const response = await apiRoot.post('/auth/register', { // Se envían el nombre de usuario y la contraseña en el cuerpo de la solicitud para registrar al nuevo usuario.
        username: payload.username,
        password: payload.password,
      })
      return response.data
    } catch (error) {
      throw new Error(parseAxiosErrorMessage(error, 'No se pudo completar el registro.'))
    }
  }, [])


  // Al montar el componente, se intenta inicializar la autenticación verificando si hay datos de autenticación almacenados. Si los datos son válidos, se establece el estado de autenticación; de lo contrario, se limpia cualquier dato corrupto y se marca como no autenticado. Se utiliza una bandera isMounted para evitar actualizar el estado si el componente se desmonta durante la operación asíncrona.
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

  const value: AuthContextValue = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout, register }),
    [user, isAuthenticated, isLoading, login, logout, register],
  )
// El proveedor de autenticación envuelve a los componentes hijos y les proporciona el contexto de autenticación con el estado actual del usuario, si está autenticado, si se está cargando, y las funciones para iniciar sesión, cerrar sesión y registrarse.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider> 
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  return context
}