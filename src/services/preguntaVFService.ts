import axios from 'axios';

// URL base de la API REST para preguntas de Verdadero/Falso
const API_URL = 'http://localhost:8080/api/preguntas/vf';

/**
 * Obtiene una lista paginada de preguntas de Verdadero/Falso
 * @param page - Número de página (0-indexed)
 * @param size - Cantidad de registros por página
 * @returns Datos paginados de preguntas
 */
export const getPreguntas = async (page: number, size: number) => {
  try {
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    throw error;
  }
};

/**
 * Obtiene una pregunta específica por su ID
 * @param id - ID de la pregunta
 * @returns Datos de la pregunta
 */
export const getPreguntaById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la pregunta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva pregunta de Verdadero/Falso
 * @param pregunta - Objeto con los datos de la nueva pregunta
 * @returns Datos de la pregunta creada
 */
export const createPregunta = async (pregunta: any) => {
  try {
    const response = await axios.post(API_URL, pregunta);
    return response.data;
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    throw error;
  }
};

/**
 * Actualiza una pregunta existente
 * @param id - ID de la pregunta a actualizar
 * @param pregunta - Objeto con los datos actualizados
 * @returns Datos de la pregunta actualizada
 */
export const updatePregunta = async (id: number, pregunta: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, pregunta);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la pregunta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Desactiva (elimina lógicamente) una pregunta
 * @param id - ID de la pregunta a desactivar
 * @returns Respuesta del servidor
 */
export const desactivarPregunta = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error al desactivar la pregunta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Reactiva una pregunta desactivada
 * @param id - ID de la pregunta a reactivar
 * @returns Datos de la pregunta reactivada
 */
export const activarPregunta = async (id: number) => {
  try {
    const response = await axios.put(`${API_URL}/activar/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al activar la pregunta con ID ${id}:`, error);
    throw error;
  }
};