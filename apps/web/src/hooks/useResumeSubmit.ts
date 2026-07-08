'use client';

import { useCallback, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  createResume,
  ResumeAlreadyExistsError,
  type CreateResumeDto,
  type ResumeResponseDto,
} from '@/services/resumeService';

interface UseResumeSubmitResult {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  data: ResumeResponseDto | null;
  submitResume: (payload: CreateResumeDto) => Promise<ResumeResponseDto | null>;
  reset: () => void;
}

export function useResumeSubmit(): UseResumeSubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<ResumeResponseDto | null>(null);

  const submitResume = useCallback(
    async (payload: CreateResumeDto): Promise<ResumeResponseDto | null> => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        const resume = await createResume(payload);
        setData(resume);
        setSuccess(true);
        return resume;
      } catch (err) {
        if (err instanceof ResumeAlreadyExistsError) {
          setError(err.message);
        } else if (err instanceof ApiError && err.status === 400) {
          setError(err.message);
        } else {
          setError('No se pudo crear el CV. Intenta nuevamente.');
        }
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setData(null);
  }, []);

  return { isSubmitting, error, success, data, submitResume, reset };
}
