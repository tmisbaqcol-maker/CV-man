# Plan de despliegue — CV Manager

Frontend en **Vercel**, backend en **Render** (contenedor Docker), base de datos en **Render Postgres** (u otra Postgres administrada equivalente: Neon, Supabase — el backend no depende de nada específico de Render más allá de variables de entorno estándar).

> **No verificado con un despliegue real.** Este plan está basado en el comportamiento documentado de Render/Vercel y en el código real de este repo, pero no hay Docker ni cuentas de Render/Vercel disponibles en este entorno de desarrollo para probarlo de punta a punta. Recomiendo validar el primer despliegue siguiendo este documento paso a paso y ajustar donde la plataforma difiera.

## Orden de despliegue (importa, por las dependencias circulares de configuración)

1. **Base de datos Postgres administrada** — se crea primero porque el backend la necesita para arrancar.
2. **Backend en Render** — se despliega con `FRONTEND_URL` apuntando *provisionalmente* a `http://localhost:3000` o vacío; se corrige en el paso 4.
3. **Frontend en Vercel** — se despliega apuntando a la URL real del backend de Render.
4. **Volver a Render** y actualizar `FRONTEND_URL` con el dominio real de Vercel, luego redeploy (Render redeploya solo al cambiar env vars si tienes "Auto-Deploy" o hay que forzarlo manualmente).

---

## 1. Base de datos (Render Postgres)

1. Crear una instancia de Postgres administrada en Render (o Neon/Supabase).
2. Aplicar el schema manualmente la primera vez (no hay migraciones de TypeORM todavía, solo `database/schema.sql`):
   ```bash
   psql "$DATABASE_URL" -f apps/api/database/schema.sql
   ```
3. Anotar los datos de conexión individuales (host, puerto, usuario, password, nombre de la base) — nuestro `app.module.ts` los espera por separado (`DB_HOST`, `DB_PORT`, etc.), no como una única `DATABASE_URL`. Si tu proveedor solo te da una connection string, tendrás que parsearla en las 5 variables, o avísame y adapto `app.module.ts` para aceptar `DATABASE_URL` directamente.

---

## 2. Backend (Render → Web Service, Docker)

1. Nuevo **Web Service** en Render, conectado al repo, con:
   - **Root Directory**: `cv-manager` (para que Render encuentre `package.json`/workspaces correctamente).
   - **Dockerfile Path**: `apps/api/Dockerfile`.
   - **Docker Build Context**: raíz del repo (`cv-manager/`) — el Dockerfile depende de esto explícitamente (ver comentario al inicio del archivo), porque `apps/api` usa dependencias hoisteadas a la raíz del workspace npm.
2. Render inyecta automáticamente la variable `PORT` — nuestro `main.ts` ya la respeta (`process.env.PORT ?? 3000`), no hay que tocar nada ahí.
3. Configurar las variables de entorno (ver tabla abajo).
4. **Health check path**: `/docs` (Swagger UI) o crear un endpoint `/health` dedicado si Render lo exige — hoy no existe uno explícito, el `AppController` raíz (`GET /`) sirve como fallback mínimo.

### Variables de entorno críticas — Backend (Render)

| Variable | Valor | Por qué es crítica |
|---|---|---|
| `DB_HOST` | host de la Postgres administrada | Sin esto no hay conexión a base de datos. |
| `DB_PORT` | normalmente `5432` | Igual que arriba. |
| `DB_USERNAME` | usuario de la Postgres administrada | Igual que arriba. |
| `DB_PASSWORD` | password de la Postgres administrada | **Secreto** — nunca en el repo, solo en el panel de Render. |
| `DB_NAME` | nombre de la base de datos | Igual que arriba. |
| `DB_SSL` | `true` | **Recién agregado en este cambio** (`app.module.ts`) — casi todas las Postgres administradas exigen TLS; sin esto la conexión falla en producción aunque funcione en local. |
| `FRONTEND_URL` | dominio real de Vercel, ej. `https://cv-manager.vercel.app` | Sin esto, CORS bloquea **todas** las peticiones del frontend en producción (ver `main.ts`, `app.enableCors`). |
| `NODE_ENV` | `production` | Convención estándar de Node; algunas libs cambian comportamiento (logs, stack traces) según esto. |

`PORT` **no** se configura manualmente — Render la inyecta.

---

## 3. Frontend (Vercel)

1. Importar el repo en Vercel.
2. **Root Directory**: `cv-manager/apps/web` (Vercel sí soporta apuntar directamente a un subdirectorio de un monorepo, a diferencia de Render con Docker).
3. Vercel detecta Next.js automáticamente (build command / output ya están definidos por el framework preset).

### Variables de entorno críticas — Frontend (Vercel)

| Variable | Valor | Por qué es crítica |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública del backend en Render, ej. `https://cv-manager-api.onrender.com` | Es literalmente el `API_BASE_URL` de `src/lib/api/client.ts` — sin esto el frontend le pega a `localhost:3001`, que no existe en producción. |

Solo hay una variable crítica hoy porque el frontend no tiene más configuración externa todavía (no hay claves de terceros, no hay auth). Cuando se agregue login, probablemente sumemos algo como `NEXT_PUBLIC_*` adicionales o nada (si el JWT vive solo en `localStorage`, como está ahora).

> **Nota:** `NEXT_PUBLIC_*` se incrusta en el bundle de JavaScript en build time — es pública por diseño. Nunca pongas ahí un secreto.

---

## 4. Verificación post-despliegue (checklist mínimo)

- [ ] `GET https://cv-manager-api.onrender.com/docs` carga la Swagger UI.
- [ ] `POST https://cv-manager-api.onrender.com/resumes` con un body válido responde `201` (confirma conexión real a Postgres con SSL).
- [ ] Desde `https://<tu-dominio>.vercel.app`, enviar el formulario y confirmar que **no** aparece un error de CORS en la consola del navegador (confirma que `FRONTEND_URL` quedó bien configurado tras el redeploy del paso 4 del orden de despliegue).
- [ ] Confirmar en los logs de Render que no hay reintentos de conexión a la base de datos (síntoma típico de `DB_SSL` mal configurado).

---

## 5. Pendiente conocido, fuera de este plan

- No hay CI que construya/pruebe la imagen Docker automáticamente antes de cada deploy — Render puede hacerlo solo si tiene el Dockerfile, pero no corre `npm test` antes. Si quieres ese gate, es un paso aparte (GitHub Actions).
- El endpoint de subida de CV a S3 sigue sin existir (contrato provisional en el frontend) — este plan de despliegue no cubre variables de AWS (`AWS_ACCESS_KEY_ID`, `AWS_S3_BUCKET`, etc.) porque construirlas ahora sería inventar infraestructura para un endpoint que no existe.
- No hay módulo de auth, por lo tanto no hay `JWT_SECRET` que configurar todavía — se agregará a este documento cuando se construya.
