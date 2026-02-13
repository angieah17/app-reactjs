import axios, { type AxiosInstance } from 'axios';

const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE)
  ? (import.meta as any).env.VITE_API_BASE
  : '';

const AUTH_STORAGE_KEY = 'authData';

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
