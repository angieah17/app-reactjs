import { apiFor } from './apiClient';

const API_PATH = '/api/preguntas/multiple';
const api = apiFor(API_PATH);

export interface IPreguntaMultiple {
  id: number | null;
  enunciado: string; // max 500 caracteres, obligatorio
  tematica: string; // max 100 caracteres, obligatorio
  fechaCreacion?: string; //al utilizar ? se indica que esta propiedad es opcional, es decir, puede estar presente o no en el objeto. ISO 8601 format
  activa?: boolean; // true por defecto
  opciones: string[]; // Array de opciones, mínimo 3, cada opción max 500 caracteres
  respuestasCorrectas: number[]; // Array de índices de opciones correctas (0-based), mínimo 1, obligatorio
  explicacion?: string | null; // max 1000 caracteres, opcional
  tipoPregunta: "MULTIPLE";
}

export interface PagedResponse<T> { //esta interfaz es genérica, lo que significa que puede ser utilizada con cualquier tipo de dato (en este caso, con IPreguntaMultiple) y se adapta a la estructura de respuesta paginada que devuelve el backend
  content: T[];
  //pageable?: unknown; Si en algún momento se necesita acceder a la información de paginación (como el número de página actual, el tamaño de página, etc.) se puede descomentar esta línea y definir la estructura de este objeto según lo que devuelva el backend.
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;

  /*Ejemplo de respuesta paginada del backend:
  {
  "content": [
    { "id": 1, "enunciado": "¿Cuáles son lenguajes de programación?", "opciones": ["Java", "Spring", "Python", "HTML"], "respuestasCorrectas": [0, 2], ... },
    { "id": 2, "enunciado": "¿Cuáles son frameworks?", "opciones": ["Express", "Django", "Spring", "CSS"], "respuestasCorrectas": [0, 1, 2], ... }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}
   *  */ 
}

// GET paginado Petición real: GET http://localhost:8080/api/preguntas/multiple?page=0&size=10
export const getAll = async (
  page = 0, //Valores por defecto
  size = 10,
): Promise<PagedResponse<IPreguntaMultiple>> => { //Promise: objeto que representa un valor futuro, en este caso la respuesta de la petición HTTP. En este caso, indica que la función devuelve una promesa que se resolverá con un objeto de tipo PagedResponse que contiene elementos de tipo IPreguntaMultiple.
  const resp = await api.get("", { params: { page, size } }); //El segundo argumento de api.get es un objeto de configuración donde se pueden pasar parámetros de consulta (query params) a través de la propiedad params. Axios construye la URL automáticamente.
  return resp.data;
};

// GET por ID
export const getById = async (id: number): Promise<IPreguntaMultiple> => {
  const resp = await api.get(`/${id}`);
  return resp.data;
};

// POST crear
export const create = async (
  pregunta: Omit<IPreguntaMultiple, "id" | "fechaCreacion" | "tipoPregunta"> & { //Omit: utilidad de TypeScript que permite crear un nuevo tipo a partir de otro, excluyendo ciertas propiedades. En este caso, se está creando un nuevo tipo a partir de IPreguntaMultiple, pero excluyendo las propiedades id, fechaCreacion y tipoPregunta, ya que estas serán generadas automáticamente por el backend.
    tipoPregunta?: "MULTIPLE";
  },
): Promise<IPreguntaMultiple> => {
  const body = { ...pregunta, tipoPregunta: "MULTIPLE" }; //Al crear una nueva pregunta, el tipo de pregunta se establece automáticamente como "MULTIPLE", independientemente de si el cliente lo incluye o no en la solicitud. Esto garantiza que todas las preguntas creadas a través de este método sean del tipo correcto.
  const resp = await api.post("", body);
  return resp.data;
};

// PUT actualizar
export const update = async (
  id: number,
  pregunta: Partial<IPreguntaMultiple>, //Partial: utilidad de TypeScript que permite crear un nuevo tipo a partir de otro, haciendo que todas sus propiedades sean opcionales. En este caso, se está creando un nuevo tipo a partir de IPreguntaMultiple, pero haciendo que todas sus propiedades sean opcionales, lo que permite enviar solo las propiedades que se desean actualizar.
): Promise<IPreguntaMultiple> => {
  const resp = await api.put(`/${id}`, pregunta);
  return resp.data;
};

// DELETE lógico (desactivar)
export const desactivar = async (id: number): Promise<IPreguntaMultiple> => {
  const resp = await api.delete(`/${id}`);
  return resp.data;
};

// PUT activar
export const activar = async (id: number): Promise<IPreguntaMultiple> => {
  const resp = await api.put(`/activar/${id}`);
  return resp.data;
};

//Creamos un objeto para exportar todos los métodos juntos y que se pueda usar en el componente preguntaMultipleService.getAll()

const preguntaMultipleService = {
  getAll,
  getById,
  create,
  update,
  desactivar,
  activar,
};

export default preguntaMultipleService;