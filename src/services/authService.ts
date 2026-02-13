/**
 * authService.ts
 * Servicio simple de autenticación para el cliente (TypeScript).
 */

import type { AxiosInstance, AxiosResponse } from 'axios';
import { apiRoot } from './api';

interface User {
  id?: number;
  username?: string;
  email?: string;
  roles?: string[];
  createdAt?: string;
  [key: string]: any;
}

interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: User;
  [key: string]: any;
}

// use shared root api instance (base URL configured in src/services/api.ts)
const api: AxiosInstance = apiRoot;

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  if (!token) return {};
  return { Authorization: token };
}

export async function login(username: string, password: string): Promise<AuthResponse | User> {
  try {
    const res: AxiosResponse<AuthResponse> = await api.post('/auth/login', { username, password });
    const data = res.data;

    let tokenStr: string | null = null;
    if (data.token) tokenStr = `Bearer ${data.token}`;
    else if (data.accessToken) tokenStr = `Bearer ${data.accessToken}`;

    if (tokenStr) localStorage.setItem('authToken', tokenStr);
    if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));
    else localStorage.setItem('currentUser', JSON.stringify(data));

    return data;
  } catch (err: any) {
    // fallback: try Basic auth to /auth/me
    if (err?.response && (err.response.status === 401 || err.response.status === 404)) {
      const basic = 'Basic ' + btoa(`${username}:${password}`);
      try {
        const res2: AxiosResponse<User> = await api.get('/auth/me', { headers: { Authorization: basic } });
        const user = res2.data;
        localStorage.setItem('authToken', basic);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      } catch (err2) {
        throw err2;
      }
    }
    throw err;
  }
}

export async function register(userData: Record<string, any>): Promise<any> {
  const res = await api.post('/auth/register', userData);
  return res.data;
}

export async function getCurrentUser(): Promise<User | null> {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch (e) {
      // fallthrough to fetch
    }
  }

  const headers = authHeader();
  if (!headers.Authorization) return null;

  try {
    const res: AxiosResponse<User> = await api.get('/auth/me', { headers });
    const user = res.data;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (e) {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

const authService = { login, register, getCurrentUser, logout };
export default authService;
