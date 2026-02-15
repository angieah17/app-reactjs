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
  page?: number;
  size?: number;
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

export const listQuestions = async (
  filters: AdminListFilters = {},
): Promise<AdminPagedResponse<AdminPregunta>> => {
  const { tematica, tipo, activa, page, size, sort } = filters;
  const resp = await api.get('', {
    params: withSort({ tematica, tipo, activa, page, size }, sort),
  });
  return resp.data;
};

export const searchQuestions = async (
  texto: string,
  filters: AdminListFilters = {},
): Promise<AdminPagedResponse<AdminPregunta>> => {
  const { tematica, tipo, activa, page, size, sort } = filters;
  const resp = await api.get('/buscar', {
    params: withSort({ texto, tematica, tipo, activa, page, size }, sort),
  });
  return resp.data;
};

export const getQuestionDetail = async (id: number): Promise<AdminPregunta> => {
  const resp = await api.get(`/${id}`);
  return resp.data;
};

export const activateQuestion = async (id: number): Promise<AdminPregunta> => {
  const resp = await api.patch(`/${id}/activar`);
  return resp.data;
};

export const deactivateQuestion = async (id: number): Promise<AdminPregunta> => {
  const resp = await api.patch(`/${id}/desactivar`);
  return resp.data;
};

export const toggleQuestion = async (id: number, activa: boolean): Promise<AdminPregunta> => {
  if (activa) {
    return deactivateQuestion(id);
  }

  return activateQuestion(id);
};

const adminPreguntaService = {
  listQuestions,
  searchQuestions,
  getQuestionDetail,
  activateQuestion,
  deactivateQuestion,
  toggleQuestion,
};

export default adminPreguntaService;