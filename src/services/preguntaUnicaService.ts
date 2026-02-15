import { apiFor } from './apiClient';
import adminPreguntaService, { type AdminListFilters } from './adminPreguntaService';

const API_PATH = '/api/admin/preguntas/unica';
const api = apiFor(API_PATH);

export interface IPreguntaUnica {
  id: number | null;
  enunciado: string;
  tematica: string; // max 100 caracteres, obligatorio
  fechaCreacion?: string;
  activa?: boolean;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion?: string | null;
  tipoPregunta: "UNICA";
}

export interface PagedResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface AdminPreguntaUnicaFilters extends Omit<AdminListFilters, 'tipo'> {}

// GET paginado Petición real: GET http://localhost:8080/api/preguntas/unica?page=0&size=10
export const getAll = async (
  page = 0,
  size = 10,
  filters: AdminPreguntaUnicaFilters = {},
): Promise<PagedResponse<IPreguntaUnica>> => {
  return adminPreguntaService.listQuestions({
    ...filters,
    tipo: 'UNICA',
    page,
    size,
  }) as Promise<PagedResponse<IPreguntaUnica>>;
};

export const search = async (
  texto: string,
  page = 0,
  size = 10,
  filters: AdminPreguntaUnicaFilters = {},
): Promise<PagedResponse<IPreguntaUnica>> => {
  return adminPreguntaService.searchQuestions(texto, {
    ...filters,
    tipo: 'UNICA',
    page,
    size,
  }) as Promise<PagedResponse<IPreguntaUnica>>;
};

// GET por ID
export const getById = async (id: number): Promise<IPreguntaUnica> => {
  return adminPreguntaService.getQuestionDetail(id) as Promise<IPreguntaUnica>;
};

// POST crear
export const create = async (
  pregunta: Omit<IPreguntaUnica, "id" | "fechaCreacion" | "tipoPregunta"> & {
    tipoPregunta?: "UNICA";
  },
): Promise<IPreguntaUnica> => {
  const body = { ...pregunta, tipoPregunta: "UNICA" };
  const resp = await api.post("", body);
  return resp.data;
};

// PUT actualizar
export const update = async (
  id: number,
  pregunta: Partial<IPreguntaUnica>,
): Promise<IPreguntaUnica> => {
  const resp = await api.put(`/${id}`, pregunta);
  return resp.data;
};

// DELETE lógico (desactivar)
export const desactivar = async (id: number): Promise<IPreguntaUnica> => {
  return adminPreguntaService.deactivateQuestion(id) as Promise<IPreguntaUnica>;
};

// PUT activar
export const activar = async (id: number): Promise<IPreguntaUnica> => {
  return adminPreguntaService.activateQuestion(id) as Promise<IPreguntaUnica>;
};

const preguntaUnicaService = {
  getAll,
  search,
  getById,
  create,
  update,
  desactivar,
  activar,
};

export default preguntaUnicaService;