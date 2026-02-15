import axios, { type AxiosInstance } from 'axios';

const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE)
  ? (import.meta as any).env.VITE_API_BASE
  : '';

const AUTH_STORAGE_KEY = 'authData';

export function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;

  const maybeAxios = error as {
    response?: {
      status?: number;
      data?: unknown;
    };
    message?: string;
  };

  const status = maybeAxios.response?.status;
  const data = maybeAxios.response?.data;

  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }

  if (data && typeof data === 'object') {
    const typed = data as { message?: unknown; error?: unknown };
    if (typeof typed.message === 'string' && typed.message.trim().length > 0) {
      return typed.message;
    }
    if (typeof typed.error === 'string' && typed.error.trim().length > 0) {
      return typed.error;
    }
  }

  switch (status) {
    case 400:
      return 'Solicitud inválida (400). Revisa los datos enviados.';
    case 401:
      return 'Sesión no válida o expirada (401). Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para esta acción (403).';
    case 404:
      return 'Recurso no encontrado (404).';
    case 500:
      return 'Error interno del servidor (500).';
    default:
      return maybeAxios.message || fallback;
  }
}

function getStoredAuthorization(): string | null {
  const bearer = localStorage.getItem('authToken');
  if (bearer) return bearer;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.credentials) {
      return `Basic ${parsed.credentials}`;
    }
  } catch {
    return null;
  }

  return null;
}

function attachInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    const authorization = getStoredAuthorization();
    if (authorization) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = authorization;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem(AUTH_STORAGE_KEY);

        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const isAuthRoute = path === '/login' || path === '/register';
          if (!isAuthRoute) {
            window.location.assign('/login');
          }
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export function apiFor(path: string, defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' }): AxiosInstance {
  return attachInterceptors(axios.create({ baseURL: BASE + path, headers: defaultHeaders }));
}

export const apiRoot: AxiosInstance = attachInterceptors(
  axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } }),
);
