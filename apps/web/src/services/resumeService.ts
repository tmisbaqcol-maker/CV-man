import { apiFetch, ApiError } from '@/lib/api/client';
import type { components } from '@/lib/api/schema.gen';

export type CreateResumeDto = components['schemas']['CreateResumeDto'];
export type ResumeResponseDto = components['schemas']['ResumeResponseDto'];

export class ResumeAlreadyExistsError extends Error {
  constructor(message = 'El usuario ya tiene un CV') {
    super(message);
    this.name = 'ResumeAlreadyExistsError';
  }
}

export async function createResume(data: CreateResumeDto): Promise<ResumeResponseDto> {
  try {
    return await apiFetch<ResumeResponseDto>('/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new ResumeAlreadyExistsError();
    }
    throw error;
  }
}

/**
 * Contrato provisional: el backend todavía no expone un endpoint de subida
 * (adaptador S3 / IFileStoragePort pendiente). Ajustar esta función y su tipo
 * de respuesta en cuanto ese endpoint exista y se regenere schema.gen.ts.
 */
export interface UploadCvFileResponse {
  fileUrl: string;
}

export async function uploadCVFile(
  file: File,
  resumeId: string,
): Promise<UploadCvFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<UploadCvFileResponse>(`/resumes/${resumeId}/cv-file`, {
    method: 'POST',
    body: formData,
  });
}
