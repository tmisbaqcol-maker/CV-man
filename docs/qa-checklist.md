# Checklist de verificación manual — CV Manager

Estado a 2026-07-08. Cada escenario indica si es **✅ verificable hoy**, **⚠️ parcialmente implementado** o **❌ bloqueado** (funcionalidad inexistente). No ejecutar los pasos de un escenario bloqueado esperando que funcionen — están documentados como criterios de aceptación para cuando se construya esa pieza.

---

## 1. Registro / Login → JWT

**Estado: ❌ Bloqueado.** No existe módulo de autenticación ni en el backend (`/auth/register`, `/auth/login`) ni en el frontend (no hay formulario de login). El interceptor de `apiFetch` (`apps/web/src/lib/api/client.ts`) ya adjunta `Authorization: Bearer <token>` si encuentra un token en `localStorage`, pero nada lo genera todavía.

### Criterios de aceptación para cuando se construya

- [ ] `POST /auth/register` con `{ email, password, fullName }` crea el usuario y responde `201`.
- [ ] `POST /auth/register` con un email ya existente responde `409`.
- [ ] `POST /auth/login` con credenciales válidas responde `200` con `{ accessToken }`.
- [ ] `POST /auth/login` con credenciales inválidas responde `401`, sin filtrar si el email existe o no.
- [ ] El frontend guarda el `accessToken` vía `setAuthToken()` (`apps/web/src/lib/auth/token-storage.ts`) tras un login exitoso.
- [ ] Tras guardar el token, cualquier petición subsiguiente a un endpoint protegido lleva el header `Authorization`. (Este paso específico **ya se puede verificar hoy** sin backend real — ver sección 4).
- [ ] Un guard en el backend rechaza con `401` las rutas protegidas sin token o con token inválido/expirado.

---

## 2. Creación de CV con payload inválido → 400

**Estado: ✅ Verificable hoy** (para el body de `POST /resumes`; la subida de archivo real sigue bloqueada, ver abajo).

### Automatizado (ya existe y pasa)

- Backend: `apps/api/src/modules/resume/infrastructure/http/dto/create-resume.dto.spec.ts` — confirma que un `CreateResumeDto` vacío produce errores de validación en `userId` y `title`.
- Frontend: `apps/web/src/components/ResumeForm.test.tsx` — mockea `createResume` devolviendo un `ApiError(400, ...)` y confirma que el banner rojo (`role="alert"`) muestra el mensaje real de validación del backend (no un mensaje genérico).

Correr ambos:
```bash
npm run test --workspace=apps/api
npm run test --workspace=apps/web
```

### Manual (requiere backend + Postgres corriendo)

1. Levantar Postgres (`docker compose` o instancia local) y aplicar `apps/api/database/schema.sql`.
2. `npm run start:dev --workspace=apps/api` (puerto `3001`).
3. `npm run dev --workspace=apps/web` (puerto `3000`).
4. En el formulario, dejar **Título del CV** vacío y usar un `ID de usuario` con formato inválido (ej. `"abc"`).
5. Enviar el formulario.
6. **Esperado:** el backend responde `400` con `message` describiendo los campos inválidos; el banner rojo del formulario muestra ese mismo mensaje (no el genérico "No se pudo crear el CV").
7. Repetir con un payload válido pero con un `userId` que ya tenga CV — **esperado:** `409`, banner rojo con "El usuario ya tiene un CV".

### Subida de archivo vacía específicamente

**Estado: ❌ Bloqueado.** `uploadCVFile` (`apps/web/src/services/resumeService.ts`) apunta a un contrato provisional (`POST /resumes/:resumeId/cv-file`) que no existe en el backend. No hay nada que probar aquí todavía.

- [ ] (Futuro) `POST /resumes/:resumeId/cv-file` sin archivo adjunto responde `400`.
- [ ] (Futuro) El frontend muestra el banner rojo si la subida falla tras crear el CV exitosamente (lógica ya presente en `ResumeForm.tsx`, pendiente de contrato real).

---

## 3. Flujo completo con URL pre-firmada de S3

**Estado: ❌ Bloqueado — arquitectura no decidida.** Nunca se diseñó un flujo de URL pre-firmada; el contrato provisional actual sube el PDF *a través de* nuestro backend (multipart), no directo a S3 desde el navegador. Tampoco hay Postgres disponible en este entorno de desarrollo (no hay Docker) para validar la persistencia real.

### Criterios de aceptación para cuando se construya (asumiendo el patrón de URL pre-firmada)

- [ ] `POST /resumes/:resumeId/cv-file/presigned-url` responde `{ uploadUrl, fileKey }` (URL de S3 con firma temporal).
- [ ] El frontend hace `PUT` directo a `uploadUrl` con el binario del PDF (sin pasar por nuestro backend).
- [ ] El frontend confirma la subida enviando `{ fileKey }` a `POST /resumes/:resumeId/cv-file/confirm`.
- [ ] El backend guarda `fileKey`/`fileUrl` en la fila de `resumes` en PostgreSQL.
- [ ] `GET /resumes/:id` posterior refleja la URL del archivo guardado.
- [ ] Si la subida a S3 falla (ej. URL expirada), el frontend muestra el banner rojo sin dejar el CV en un estado inconsistente.

---

## 4. Lo que sí se puede verificar hoy, de punta a punta

- [x] El formulario (`ResumeForm.tsx`) muestra spinner mientras `isSubmitting` — verificado en `ResumeForm.test.tsx` y en el navegador real.
- [x] Banner rojo ante fallo de red (backend caído) — verificado manualmente en el navegador.
- [x] Interceptor JWT: con un token en `localStorage`, la petición saliente a `/resumes` incluye `Authorization: Bearer <token>` — verificado interceptando `window.fetch` en el navegador real.
- [x] CORS configurado en el backend vía `FRONTEND_URL` — verificado por lectura de código y `tsc`; no probado contra un backend corriendo (pendiente de Postgres).
