import axios, { type AxiosInstance } from 'axios';

const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE)
  ? (import.meta as any).env.VITE_API_BASE
  : '';

export function apiFor(path: string, defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' }): AxiosInstance {
  return axios.create({ baseURL: BASE + path, headers: defaultHeaders });
}

export const apiRoot: AxiosInstance = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });
