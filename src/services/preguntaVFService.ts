import { apiFor } from './apiClient';
import adminPreguntaService, { type AdminListFilters } from './adminPreguntaService';

const API_PATH = '/api/preguntas/vf';
const api = apiFor(API_PATH);

export interface IPreguntaVF {
  id: number | null;
  enunciado: string;
  tematica: string; // max 100 caracteres, obligatorio
  fechaCreacion?: string; //al utilizar ? se indica que esta propiedad es opcional, es decir, puede estar presente o no en el objeto
  activa?: boolean;
  respuestaCorrecta: boolean;
  explicacion?: string | null;
  tipoPregunta: "VERDADERO_FALSO";
}

export interface PagedResponse<T> { //esta interfaz es genérica, lo que significa que puede ser utilizada con cualquier tipo de dato (en este caso, con IPreguntaVF) y se adapta a la estructura de respuesta paginada que devuelve el backend
  content: T[];
  //pageable?: unknown; Si esn algún momento se necesita acceder a la información de paginación (como el número de página actual, el tamaño de página, etc.) se puede descomentar esta línea y definir la estructura de este objeto según lo que devuelva el backend.
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;

  /*Ejemplo de respuesta paginada del backend:
  {
  "content": [
    { "id": 1, "enunciado": "¿Java es tipado?", ... },
    { "id": 2, "enunciado": "¿Spring usa IoC?", ... }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}

export interface AdminPreguntaVFFilters extends Omit<AdminListFilters, 'tipo'> {}
   *  */ 
}

// GET paginado Petición real: GET http://localhost:8080/api/preguntas/vf?page=0&size=10
export const getAll = async (
  page = 0, //Valores por defecto
  size = 10,
  filters: AdminPreguntaVFFilters = {},
): Promise<PagedResponse<IPreguntaVF>> => { //Promise: objeto que representa un valor futuro, en este caso la respuesta de la petición HTTP. En este caso, indica que la función devuelve una promesa que se resolverá con un objeto de tipo PagedResponse que contiene elementos de tipo IPreguntaVF.
  return adminPreguntaService.listQuestions({
    ...filters,
    tipo: 'VERDADERO_FALSO',
    page,
    size,
  }) as Promise<PagedResponse<IPreguntaVF>>;
};

export const search = async (
  texto: string,
  page = 0,
  size = 10,
  filters: AdminPreguntaVFFilters = {},
): Promise<PagedResponse<IPreguntaVF>> => {
  return adminPreguntaService.searchQuestions(texto, {
    ...filters,
    tipo: 'VERDADERO_FALSO',
    page,
    size,
  }) as Promise<PagedResponse<IPreguntaVF>>;
};

// GET por ID
export const getById = async (id: number): Promise<IPreguntaVF> => {
  return adminPreguntaService.getQuestionDetail(id) as Promise<IPreguntaVF>;
};

// POST crear
export const create = async (
  pregunta: Omit<IPreguntaVF, "id" | "fechaCreacion" | "tipoPregunta"> & { //Omit: utilidad de TypeScript que permite crear un nuevo tipo a partir de otro, excluyendo ciertas propiedades. En este caso, se está creando un nuevo tipo a partir de IPreguntaVF, pero excluyendo las propiedades id, fechaCreacion y tipoPregunta, ya que estas serán generadas automáticamente por el backend.
    tipoPregunta?: "VERDADERO_FALSO";
  },
): Promise<IPreguntaVF> => {
  const body = { ...pregunta, tipoPregunta: "VERDADERO_FALSO" }; //Al crear una nueva pregunta, el tipo de pregunta se establece automáticamente como "VERDADERO_FALSO", independientemente de si el cliente lo incluye o no en la solicitud. Esto garantiza que todas las preguntas creadas a través de este método sean del tipo correcto.
  const resp = await api.post("", body);
  return resp.data;
};

// PUT actualizar
export const update = async (
  id: number,
  pregunta: Partial<IPreguntaVF>, //Partial: utilidad de TypeScript que permite crear un nuevo tipo a partir de otro, haciendo que todas sus propiedades sean opcionales. En este caso, se está creando un nuevo tipo a partir de IPreguntaVF, pero haciendo que todas sus propiedades sean opcionales, lo que permite enviar solo las propiedades que se desean actualizar.
): Promise<IPreguntaVF> => {
  const resp = await api.put(`/${id}`, pregunta);
  return resp.data;
};

// DELETE lógico (desactivar)
export const desactivar = async (id: number): Promise<IPreguntaVF> => {
  return adminPreguntaService.deactivateQuestion(id) as Promise<IPreguntaVF>;
};

// PUT activar
export const activar = async (id: number): Promise<IPreguntaVF> => {
  return adminPreguntaService.activateQuestion(id) as Promise<IPreguntaVF>;
};

//Creamos un objeto para exportar todos los métodos juntos y que se pueda usar en el componente IPreguntaVFService.getAll()

const preguntaVFService = {
  getAll,
  search,
  getById,
  create,
  update,
  desactivar,
  activar,
};

export default preguntaVFService;