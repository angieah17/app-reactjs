import axios, { type AxiosInstance } from "axios";

const API_BASE = "http://localhost:8080";
const API_PATH = "/api/preguntas/vf";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE + API_PATH,
  headers: { "Content-Type": "application/json" },
});

export interface PreguntaVF {
  id: number | null;
  enunciado: string;
  tematica?: string | null;
  fechaCreacion?: string;
  activa?: boolean;
  respuestaCorrecta: boolean;
  explicacion?: string | null;
  tipoPregunta: "VERDADERO_FALSO";
}

export interface PagedResponse<T> {
  content: T[];
  pageable?: any;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

// GET paginado
export const getAll = async (
  page = 0, //Valores por defecto
  size = 10,
): Promise<PagedResponse<PreguntaVF>> => {
  const resp = await api.get("/", { params: { page, size } });
  return resp.data;
};

// GET por ID
export const getById = async (id: number): Promise<PreguntaVF> => {
  const resp = await api.get(`/${id}`);
  return resp.data;
};

// POST crear
export const create = async (
  pregunta: Omit<PreguntaVF, "id" | "fechaCreacion" | "tipoPregunta"> & {
    tipoPregunta?: "VERDADERO_FALSO";
  },
): Promise<PreguntaVF> => {
  const body = { ...pregunta, tipoPregunta: "VERDADERO_FALSO" };
  const resp = await api.post("/", body);
  return resp.data;
};

// PUT actualizar
export const update = async (
  id: number,
  pregunta: Partial<PreguntaVF>,
): Promise<PreguntaVF> => {
  const resp = await api.put(`/${id}`, pregunta);
  return resp.data;
};

// DELETE lógico (desactivar)
export const desactivar = async (id: number): Promise<PreguntaVF> => {
  const resp = await api.delete(`/${id}`);
  return resp.data;
};

// PUT activar
export const activar = async (id: number): Promise<PreguntaVF> => {
  const resp = await api.put(`/activar/${id}`);
  return resp.data;
};

//Creamos un objeto para exportar todos los métodos juntos y que se pueda usar en el componente preguntaService.getAll()

const preguntaVFService = {
  getAll,
  getById,
  create,
  update,
  desactivar,
  activar,
};

export default preguntaVFService;