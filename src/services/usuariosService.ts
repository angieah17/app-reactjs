import { apiFor, apiRoot } from './apiClient';

const api = apiFor('/api/usuarios');

export type UsuarioRole = 'ADMIN' | 'USER';

export interface UsuarioDTO {
  id: number;
  username: string;
  role: UsuarioRole | string;
  enabled: boolean;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface UsuarioListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface UsuarioPayload {
  username: string;
  password?: string;
  role: UsuarioRole;
  enabled: boolean;
}

export interface CurrentUser {
  id: number;
  username: string;
  role: string;
  enabled: boolean;
}

export async function getMe(): Promise<CurrentUser> {
  const response = await apiRoot.get('/auth/me');
  return response.data;
}

export async function listUsuarios({ page = 0, size = 10, sort = 'id,desc' }: UsuarioListParams = {}): Promise<PageResponse<UsuarioDTO>> {
  const response = await api.get('', {
    params: { page, size, sort },
  });
  return response.data;
}

export async function getUsuario(id: number): Promise<UsuarioDTO> {
  const response = await api.get(`/${id}`);
  return response.data;
}

export async function createUsuario(payload: UsuarioPayload): Promise<UsuarioDTO> {
  const response = await api.post('', payload);
  return response.data;
}

export async function updateUsuario(id: number, payload: UsuarioPayload): Promise<UsuarioDTO> {
  const response = await api.put(`/${id}`, payload);
  return response.data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await api.delete(`/${id}`);
}

const usuariosService = {
  getMe,
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};

export default usuariosService;
