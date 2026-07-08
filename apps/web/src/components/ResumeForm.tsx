'use client';

import { useCallback, useState, type DragEvent, type FormEvent } from 'react';
import { useResumeSubmit } from '@/hooks/useResumeSubmit';
import { uploadCVFile } from '@/services/resumeService';

const ACCEPTED_FILE_TYPE = 'application/pdf';

export function ResumeForm() {
  const { isSubmitting, error, success, submitResume } = useResumeSubmit();

  // Temporal: hasta que exista un módulo de autenticación, el userId se pide
  // como campo del formulario. Cuando haya JWT, se tomará de la sesión y este
  // campo desaparecerá.
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback((candidate: File | null) => {
    setUploadError(null);
    if (candidate && candidate.type !== ACCEPTED_FILE_TYPE) {
      setUploadError('Solo se aceptan archivos PDF.');
      return;
    }
    setFile(candidate);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFile(event.dataTransfer.files[0] ?? null);
    },
    [handleFile],
  );

  const openFilePicker = () => {
    document.getElementById('cv-file-input')?.click();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);

    const resume = await submitResume({
      userId,
      title,
      summary: summary || undefined,
    });

    if (resume && file) {
      try {
        await uploadCVFile(file, resume.id);
      } catch {
        setUploadError(
          'El CV se creó, pero no se pudo subir el archivo. Intenta subirlo de nuevo más tarde.',
        );
      }
    }
  };

  const displayError = error ?? uploadError;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Crear hoja de vida
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Completa los datos básicos y adjunta tu CV en PDF.
        </p>
      </div>

      {displayError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {displayError}
        </div>
      )}

      {success && !displayError && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
        >
          CV creado correctamente.
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="userId"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          ID de usuario
        </label>
        <input
          id="userId"
          name="userId"
          type="text"
          required
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="title"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Título del CV
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={255}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="summary"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Resumen profesional
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span
          id="cv-file-label"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Archivo del CV (PDF)
        </span>
        <div
          role="button"
          tabIndex={0}
          aria-labelledby="cv-file-label"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openFilePicker();
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
              : 'border-slate-300 hover:border-indigo-400 dark:border-slate-700'
          }`}
        >
          <input
            id="cv-file-input"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {file.name}
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Arrastra tu CV en PDF aquí o haz clic para seleccionarlo
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Solo archivos .pdf
              </p>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {isSubmitting && <Spinner />}
        {isSubmitting ? 'Guardando...' : 'Crear CV'}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
