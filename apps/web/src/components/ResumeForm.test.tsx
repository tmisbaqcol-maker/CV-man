import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeForm } from './ResumeForm';
import { ApiError } from '@/lib/api/client';
import type { ResumeResponseDto } from '@/services/resumeService';

vi.mock('@/services/resumeService', () => ({
  createResume: vi.fn(),
  uploadCVFile: vi.fn(),
  ResumeAlreadyExistsError: class ResumeAlreadyExistsError extends Error {},
}));

const { createResume } = await import('@/services/resumeService');

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('ID de usuario'), {
    target: { value: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
  });
  fireEvent.change(screen.getByLabelText('Título del CV'), {
    target: { value: 'Backend Engineer' },
  });
}

describe('ResumeForm', () => {
  beforeEach(() => {
    vi.mocked(createResume).mockReset();
  });

  it('muestra el mensaje de validación del backend cuando la API responde 400', async () => {
    vi.mocked(createResume).mockRejectedValue(
      new ApiError(400, 'title should not be empty, userId must be a UUID'),
    );

    render(<ResumeForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Crear CV' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'title should not be empty, userId must be a UUID',
    );
  });

  it('muestra el spinner y deshabilita el botón mientras se envía', async () => {
    let resolveCreateResume!: (value: ResumeResponseDto) => void;
    vi.mocked(createResume).mockReturnValue(
      new Promise<ResumeResponseDto>((resolve) => {
        resolveCreateResume = resolve;
      }),
    );

    render(<ResumeForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Crear CV' }));

    expect(screen.getByRole('button', { name: /Guardando/ })).toBeDisabled();

    resolveCreateResume({
      id: 'resume-1',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Backend Engineer',
      summary: null,
      workExperiences: [],
      education: [],
      skills: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
});
