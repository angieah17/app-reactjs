import axios, { type AxiosInstance } from "axios";

const API_BASE = "http://localhost:8080";
const API_PATH = "/api/preguntas/unica";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE + API_PATH,
  headers: { "Content-Type": "application/json" },
});

export interface IPreguntaUnica {
  id: number | null;
  enunciado: string;
  tematica?: string | null;
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

// GET paginado Petición real: GET http://localhost:8080/api/preguntas/unica?page=0&size=10
export const getAll = async (
  page = 0,
  size = 10,
): Promise<PagedResponse<IPreguntaUnica>> => {
  const resp = await api.get("", { params: { page, size } });
  return resp.data;
};

// GET por ID
export const getById = async (id: number): Promise<IPreguntaUnica> => {
  const resp = await api.get(`/${id}`);
  return resp.data;
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
  const resp = await api.delete(`/${id}`);
  return resp.data;
};

// PUT activar
export const activar = async (id: number): Promise<IPreguntaUnica> => {
  const resp = await api.put(`/activar/${id}`);
  return resp.data;
};

const preguntaUnicaService = {
  getAll,
  getById,
  create,
  update,
  desactivar,
  activar,
};

export default preguntaUnicaService;