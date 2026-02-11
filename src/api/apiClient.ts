import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

// ==================== TIPOS ====================

/**
 * Interfaz para almacenar credenciales HTTP Basic en memoria
 */
interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * Tipo para errores de la API
 */
export type ApiError = AxiosError;

// ==================== CONFIGURACIÓN ====================

/**
 * Variable privada para almacenar credenciales en memoria
 * No se usa localStorage ni cookies
 */
let credentials: AuthCredentials | null = null;

/**
 * URL base de la API desde variables de entorno
 */
const API_BASE_URL = import.meta.env.VITE_API_URL as string;

/**
 * Validar que la URL base esté configurada
 */
if (!API_BASE_URL) {
  console.error(
    "Error: VITE_API_URL no está configurado en las variables de entorno. Por favor, agrega VITE_API_URL a tu archivo .env",
  );
}

/**
 * Configuración inicial del cliente Axios
 */
const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// ==================== FUNCIONES HELPER ====================

/**
 * Obtiene las credenciales almacenadas en memoria
 * @returns Las credenciales o null si no están configuradas
 */
function getAuthCredentials(): AuthCredentials | null {
  return credentials;
}

/**
 * Guarda las credenciales HTTP Basic en memoria
 * Las credenciales se usan automáticamente en todas las requests
 * @param username - Nombre de usuario
 * @param password - Contraseña
 */
export function setAuthCredentials(username: string, password: string): void {
  credentials = {
    username,
    password,
  };
}

/**
 * Limpia las credenciales almacenadas en memoria
 * Llama a esta función al cerrar sesión
 */
export function clearAuthCredentials(): void {
  credentials = null;
}

/**
 * Codifica credenciales en base64 para HTTP Basic
 * @param username - Nombre de usuario
 * @param password - Contraseña
 * @returns String codificado en base64 para el header Authorization
 */
function encodeBasicCredentials(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${btoa(credentials)}`;
}

// ==================== INSTANCIA AXIOS ====================

/**
 * Instancia configurada de Axios con interceptores
 */
const apiClient: AxiosInstance = axios.create(axiosConfig);

// ==================== INTERCEPTOR DE REQUEST ====================

/**
 * Interceptor que agrega el header Authorization con HTTP Basic
 * si las credenciales están configuradas
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authCredentials = getAuthCredentials();

    // Si existen credenciales en memoria, agregarlas al header
    if (authCredentials !== null) {
      const basicAuth = encodeBasicCredentials(authCredentials.username, authCredentials.password);
      config.headers.Authorization = basicAuth;
    }

    return config;
  },
  (error: ApiError): Promise<ApiError> => {
    return Promise.reject(error);
  },
);

// ==================== INTERCEPTOR DE RESPONSE ====================

/**
 * Interceptor que maneja errores de autenticación
 * Si recibe 401 (Unauthorized), limpia las credenciales
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: ApiError): Promise<ApiError> => {
    // Si la respuesta es 401, limpiar credenciales automáticamente
    if (error.response?.status === 401) {
      clearAuthCredentials();
      console.warn("Credenciales inválidas. Sesión cerrada automáticamente.");
    }

    // Lanzar el error para que el componente lo maneje
    return Promise.reject(error);
  },
);

// ==================== EXPORTACIONES ====================

export default apiClient;
