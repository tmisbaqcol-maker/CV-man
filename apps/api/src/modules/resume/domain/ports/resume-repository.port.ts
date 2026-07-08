import { Resume } from '../entities/resume.entity';

export const RESUME_REPOSITORY = Symbol('IResumeRepository');

export interface IResumeRepository {
  save(resume: Resume): Promise<Resume>;
  findById(id: string): Promise<Resume | null>;
  findByUserId(userId: string): Promise<Resume | null>;
  update(id: string, resume: Resume): Promise<Resume>;
}
