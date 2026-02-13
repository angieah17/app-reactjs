/**
 * authService.ts
 * Servicio simple de autenticación para el cliente (TypeScript).
 */

type User = Record<string, any>;

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE)
  ? (import.meta as any).env.VITE_API_BASE
  : '';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  if (!token) return {};
  return { Authorization: token };
}

export async function login(username: string, password: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      let tokenStr: string | null = null;
      if (data.token) tokenStr = `Bearer ${data.token}`;
      else if (data.accessToken) tokenStr = `Bearer ${data.accessToken}`;

      if (tokenStr) localStorage.setItem('authToken', tokenStr);
      if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));
      else if (data.user === undefined) localStorage.setItem('currentUser', JSON.stringify(data));

      return data;
    }

    if (res.status === 401 || res.status === 404) {
      const basic = 'Basic ' + btoa(`${username}:${password}`);
      const res2 = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: basic },
      });
      if (res2.ok) {
        const user = await res2.json();
        localStorage.setItem('authToken', basic);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
    }

    const text = await res.text();
    throw new Error(text || 'Login failed');
  } catch (err) {
    throw err;
  }
}

export async function register(userData: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Register failed');
  }
  return res.json();
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

  const res = await fetch(`${API_BASE}/auth/me`, { headers });
  if (!res.ok) return null;
  const user = await res.json();
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user as User;
}

export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

const authService = { login, register, getCurrentUser, logout };
export default authService;
