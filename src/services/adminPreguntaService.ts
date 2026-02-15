import { apiFor } from './apiClient';

const API_PATH = '/api/admin/preguntas';
const api = apiFor(API_PATH);

export type TipoPreguntaAdmin = 'VERDADERO_FALSO' | 'UNICA' | 'MULTIPLE';

export interface AdminPregunta {
  id: number;
  enunciado: string;
  tematica: string;
  fechaCreacion?: string;
  activa?: boolean;
  tipoPregunta: TipoPreguntaAdmin;
  explicacion?: string | null;
  respuestaCorrecta?: boolean | number;
  respuestasCorrectas?: number[];
  opciones?: string[];
}

export interface AdminPagedResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface AdminListFilters {
  tematica?: string;
  tipo?: TipoPreguntaAdmin;
  activa?: boolean;
  sort?: string | string[];
}

function withSort<T extends Record<string, unknown>>(params: T, sort?: string | string[]) {
  if (!sort || (Array.isArray(sort) && sort.length === 0)) {
    return params;
  }

  return {
    ...params,
    sort,
  };
}

type TipoPath = 'verdadero-falso' | 'unica' | 'multiple';

function toTipoPath(tipo: TipoPreguntaAdmin): TipoPath {
  switch (tipo) {
    case 'VERDADERO_FALSO':
      return 'verdadero-falso';
    case 'UNICA':
      return 'unica';
    case 'MULTIPLE':
      return 'multiple';
    default:
      return 'unica';
  }
}

export interface AdminVFPayload {
  enunciado: string;
  tematica: string;
  explicacion?: string | null;
  activa?: boolean;
  respuestaCorrecta: boolean;
}

export interface AdminUnicaPayload {
  enunciado: string;
  tematica: string;
  explicacion?: string | null;
  activa?: boolean;
  opciones: string[];
  respuestaCorrecta: number;
}

export interface AdminMultiplePayload {
  enunciado: string;
  tematica: string;
  explicacion?: string | null;
  activa?: boolean;
  opciones: string[];
  respuestasCorrectas: number[];
}

export type AdminCreatePayload = AdminVFPayload | AdminUnicaPayload | AdminMultiplePayload;
export type AdminUpdatePayload = Partial<AdminVFPayload> | Partial<AdminUnicaPayload> | Partial<AdminMultiplePayload>;

export const listQuestions = async (
  filters: AdminListFilters = {},
  page = 0,
  size = 10,
  sort: string | string[] = 'fechaCreacion,desc',
): Promise<AdminPagedResponse<AdminPregunta>> => {
  const { tematica, tipo, activa } = filters;
  const resp = await api.get('', {
    params: withSort({ tematica, tipo, activa, page, size }, sort),
  });
  return resp.data;
};

export const searchQuestions = async (
  texto: string,
  filters: AdminListFilters = {},
  page = 0,
  size = 10,
  sort: string | string[] = 'fechaCreacion,desc',
): Promise<AdminPagedResponse<AdminPregunta>> => {
  const { tematica, tipo, activa } = filters;
  const resp = await api.get('/buscar', {
    params: withSort({ texto, tematica, tipo, activa, page, size }, sort),
  });
  return resp.data;
};

export const getQuestionById = async (id: number): Promise<AdminPregunta> => {
  const resp = await api.get(`/${id}`);
  return resp.data;
};

export const getQuestionDetail = getQuestionById;

export const activateQuestion = async (id: number): Promise<AdminPregunta> => {
  const resp = await api.patch(`/${id}/activar`);
  return resp.data;
};

export const deactivateQuestion = async (id: number): Promise<AdminPregunta> => {
  const resp = await api.patch(`/${id}/desactivar`);
  return resp.data;
};

export const toggleQuestion = async (id: number, activaActual: boolean): Promise<AdminPregunta> => {
  if (activaActual) {
    return deactivateQuestion(id);
  }

  return activateQuestion(id);
};

export const createQuestion = async (
  tipoPregunta: TipoPreguntaAdmin,
  payload: AdminCreatePayload,
): Promise<AdminPregunta> => {
  const path = toTipoPath(tipoPregunta);
  const resp = await api.post(`/${path}`, payload);
  return resp.data;
};

export const updateQuestion = async (
  tipoPregunta: TipoPreguntaAdmin,
  id: number,
  payload: AdminUpdatePayload,
): Promise<AdminPregunta> => {
  const path = toTipoPath(tipoPregunta);
  const resp = await api.put(`/${path}/${id}`, payload);
  return resp.data;
};

const adminPreguntaService = {
  listQuestions,
  searchQuestions,
  getQuestionById,
  getQuestionDetail,
  activateQuestion,
  deactivateQuestion,
  toggleQuestion,
  createQuestion,
  updateQuestion,
};

export default adminPreguntaService;