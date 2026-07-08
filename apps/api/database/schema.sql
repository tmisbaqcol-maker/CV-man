-- ============================================================
-- CV Manager — Esquema de base de datos PostgreSQL
-- Entidades: User, Resume, WorkExperience, Education, Skill
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- búsqueda parcial/fuzzy por nombre de skill

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_users_email ON users (email);

-- ------------------------------------------------------------
-- resumes  (regla de negocio: un usuario tiene, a lo sumo, un CV)
-- ------------------------------------------------------------
CREATE TABLE resumes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    summary     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unicidad a nivel de BD: refuerza la invariante que valida CreateResumeUseCase
CREATE UNIQUE INDEX uq_resumes_user_id ON resumes (user_id);

-- ------------------------------------------------------------
-- work_experiences  (N:1 con resumes)
-- ------------------------------------------------------------
CREATE TABLE work_experiences (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id     UUID NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    company_name  VARCHAR(255) NOT NULL,
    position      VARCHAR(255) NOT NULL,
    start_date    DATE NOT NULL,
    end_date      DATE,
    is_current    BOOLEAN NOT NULL DEFAULT false,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_work_experience_dates
        CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_work_experiences_resume_id ON work_experiences (resume_id);

-- ------------------------------------------------------------
-- education  (N:1 con resumes)
-- ------------------------------------------------------------
CREATE TABLE education (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id       UUID NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    institution     VARCHAR(255) NOT NULL,
    degree          VARCHAR(255) NOT NULL,
    field_of_study  VARCHAR(255),
    start_date      DATE NOT NULL,
    end_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_education_dates
        CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_education_resume_id ON education (resume_id);

-- ------------------------------------------------------------
-- skills  (catálogo maestro, deduplicado — evita "JavaScript" vs "javascript")
-- ------------------------------------------------------------
CREATE TABLE skills (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(100) NOT NULL,
    normalized_name  VARCHAR(100) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Búsqueda exacta / dedupe al insertar
CREATE UNIQUE INDEX uq_skills_normalized_name ON skills (normalized_name);

-- Búsqueda parcial ("java" -> "JavaScript", "Java") vía trigram
CREATE INDEX idx_skills_normalized_name_trgm
    ON skills USING gin (normalized_name gin_trgm_ops);

-- ------------------------------------------------------------
-- resume_skills  (N:M entre resumes y skills)
-- ------------------------------------------------------------
CREATE TABLE resume_skills (
    resume_id          UUID NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    skill_id           UUID NOT NULL REFERENCES skills (id) ON DELETE CASCADE,
    proficiency_level  SMALLINT CHECK (proficiency_level BETWEEN 1 AND 5),
    PRIMARY KEY (resume_id, skill_id)
);

-- El PK (resume_id, skill_id) ya optimiza "skills de un resume".
-- Este índice optimiza la búsqueda inversa: "resumes que tienen la skill X".
CREATE INDEX idx_resume_skills_skill_id ON resume_skills (skill_id);
