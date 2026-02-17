import { apiFor } from './apiClient';
import { getAuthData } from '../utils/authUtils';

const uploadApi = apiFor('/api/admin/preguntas', {});

function getBasicAuthorizationHeader(): string | undefined {
  const authData = getAuthData();
  if (!authData?.credentials) {
    return undefined;
  }

  return `Basic ${authData.credentials}`;
}

export async function uploadPreguntasCsv(file: File): Promise<number> {
  const formData = new FormData();
  formData.append('file', file);

  const authorization = getBasicAuthorizationHeader();
  const headers: Record<string, string> = {};
  if (authorization) {
    headers.Authorization = authorization;
  }

  const response = await uploadApi.post<number>('/upload', formData, {
    headers,
  });

  return response.data;
}

const adminPreguntaUploadService = {
  uploadPreguntasCsv,
};

export default adminPreguntaUploadService;