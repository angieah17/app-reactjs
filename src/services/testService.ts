import { apiFor } from './apiClient';

const API_PATH = '/api/tests';
const api = apiFor(API_PATH);

export type TipoPregunta = 'VERDADERO_FALSO' | 'UNICA' | 'MULTIPLE';

export interface TestFilters {
  tematica?: string;
  tipoPregunta?: TipoPregunta;
  limite?: number;
}

export interface TestPreguntaDTO {
  id: number;
  enunciado: string;
  tipoPregunta: TipoPregunta;
  opciones: string[] | null;
}

export interface TestPlayDTO {
  preguntas: TestPreguntaDTO[];
  tematica: string | null;
  tipoPregunta: TipoPregunta | null;
  totalPreguntas: number;
}

export type RespuestaVFDTO = {
  respuestaVF: boolean;
  respuestaUnica?: never;
  respuestaMultiple?: never;
};

export type RespuestaUnicaDTO = {
  respuestaVF?: never;
  respuestaUnica: number;
  respuestaMultiple?: never;
};

export type RespuestaMultipleDTO = {
  respuestaVF?: never;
  respuestaUnica?: never;
  respuestaMultiple: number[];
};

export type RespuestaDTO = RespuestaVFDTO | RespuestaUnicaDTO | RespuestaMultipleDTO;

export interface TestSubmitDTO {
  respuestas: Record<number, RespuestaDTO>;
}

export interface TestSubmitFilters {
  tematica?: string;
  tipoPregunta?: TipoPregunta;
}

export interface RevisionPreguntaDTO {
  preguntaId: number;
  enunciado: string;
  tipoPregunta: TipoPregunta;
  esCorrecta: boolean;
  respuestaUsuario: string;
  respuestaCorrecta: string;
  explicacion: string | null;
}

export interface TestResultDTO {
  puntuacion: number;
  totalPreguntas: number;
  preguntasCorrectas: number;
  preguntasIncorrectas: number;
  porcentajeAcierto: number;
  revision: RevisionPreguntaDTO[];
}

export interface TestHistorialDTO {
  id: number;
  puntuacion: number;
  tematica: string | null;
  fechaRealizacion: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

function isRespuestaDTO(value: unknown): value is RespuestaDTO {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const obj = value as Record<string, unknown>;

  if (Object.prototype.hasOwnProperty.call(obj, 'respuestaVF')) {
    return typeof obj.respuestaVF === 'boolean';
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'respuestaUnica')) {
    return typeof obj.respuestaUnica === 'number' && Number.isInteger(obj.respuestaUnica);
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'respuestaMultiple')) {
    return Array.isArray(obj.respuestaMultiple)
      && obj.respuestaMultiple.every((item) => typeof item === 'number' && Number.isInteger(item));
  }

  return false;
}

function buildSubmitBody(respuestas: TestSubmitDTO['respuestas']): TestSubmitDTO {
  const validatedEntries = Object.entries(respuestas).map(([preguntaId, respuesta]) => {
    if (!isRespuestaDTO(respuesta)) {
      throw new Error(`Respuesta inválida para pregunta ${preguntaId}. Debe ser RespuestaDTO real.`);
    }

    return [preguntaId, respuesta] as const;
  });

  return {
    respuestas: Object.fromEntries(validatedEntries) as TestSubmitDTO['respuestas'],
  };
}

export const generateTest = async (filters: TestFilters = {}): Promise<TestPlayDTO> => {
  const resp = await api.get('', {
    params: {
      tematica: filters.tematica,
      tipoPregunta: filters.tipoPregunta,
      limite: filters.limite,
    },
  });

  return resp.data;
};

export const submitTest = async (
  respuestas: TestSubmitDTO['respuestas'],
  filters: TestSubmitFilters = {},
): Promise<TestResultDTO> => {
  const body = buildSubmitBody(respuestas);

  const resp = await api.post('/submit', body, {
    params: {
      tematica: filters.tematica,
      tipoPregunta: filters.tipoPregunta,
    },
  });

  return resp.data;
};

export const getTestHistory = async (
  page = 0,
  pageSize = 10,
): Promise<PageResponse<TestHistorialDTO>> => {
  const resp = await api.get('/historial', { params: { page, pageSize, size: pageSize } });
  return resp.data;
};

const testService = {
  generateTest,
  submitTest,
  getTestHistory,
};

export default testService;
