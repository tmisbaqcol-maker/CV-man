import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Resume } from '../../domain/entities/resume.entity';
import { WorkExperience } from '../../domain/entities/work-experience.entity';
import { Education } from '../../domain/entities/education.entity';
import { ResumeSkill } from '../../domain/entities/resume-skill.entity';
import { RESUME_REPOSITORY } from '../../domain/ports/resume-repository.port';
import type { IResumeRepository } from '../../domain/ports/resume-repository.port';
import { ResumeAlreadyExistsException } from '../../domain/exceptions/resume-already-exists.exception';

export interface CreateResumeCommand {
  userId: string;
  title: string;
  summary?: string | null;
  workExperiences?: Array<{
    companyName: string;
    position: string;
    startDate: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
    description?: string | null;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    startDate: Date;
    endDate?: Date | null;
  }>;
  skills?: Array<{ name: string; proficiencyLevel?: number | null }>;
}

@Injectable()
export class CreateResumeUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepository: IResumeRepository,
  ) {}

  async execute(command: CreateResumeCommand): Promise<Resume> {
    const existingResume = await this.resumeRepository.findByUserId(
      command.userId,
    );

    if (existingResume) {
      throw new ResumeAlreadyExistsException(command.userId);
    }

    const now = new Date();

    const resume = new Resume(
      randomUUID(),
      command.userId,
      command.title,
      command.summary ?? null,
      (command.workExperiences ?? []).map(
        (we) =>
          new WorkExperience(
            randomUUID(),
            we.companyName,
            we.position,
            we.startDate,
            we.endDate ?? null,
            we.isCurrent ?? false,
            we.description ?? null,
          ),
      ),
      (command.education ?? []).map(
        (ed) =>
          new Education(
            randomUUID(),
            ed.institution,
            ed.degree,
            ed.fieldOfStudy ?? null,
            ed.startDate,
            ed.endDate ?? null,
          ),
      ),
      (command.skills ?? []).map(
        (s) => new ResumeSkill(randomUUID(), s.name, s.proficiencyLevel ?? null),
      ),
      now,
      now,
    );

    return this.resumeRepository.save(resume);
  }
}
