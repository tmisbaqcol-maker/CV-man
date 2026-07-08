import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IResumeRepository } from '../../domain/ports/resume-repository.port';
import { Resume } from '../../domain/entities/resume.entity';
import { ResumeOrmEntity } from './orm-entities/resume.orm-entity';
import { WorkExperienceOrmEntity } from './orm-entities/work-experience.orm-entity';
import { EducationOrmEntity } from './orm-entities/education.orm-entity';
import { SkillOrmEntity } from './orm-entities/skill.orm-entity';
import { ResumeSkillOrmEntity } from './orm-entities/resume-skill.orm-entity';
import { ResumeMapper } from './resume.mapper';

@Injectable()
export class ResumeTypeOrmRepository implements IResumeRepository {
  constructor(
    @InjectRepository(ResumeOrmEntity)
    private readonly resumeRepo: Repository<ResumeOrmEntity>,
    @InjectRepository(SkillOrmEntity)
    private readonly skillRepo: Repository<SkillOrmEntity>,
  ) {}

  async save(resume: Resume): Promise<Resume> {
    const orm = await this.toOrmEntity(resume);
    const saved = await this.resumeRepo.save(orm);
    return this.reload(saved.id);
  }

  async findById(id: string): Promise<Resume | null> {
    const orm = await this.resumeRepo.findOne({ where: { id } });
    return orm ? ResumeMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<Resume | null> {
    const orm = await this.resumeRepo.findOne({ where: { userId } });
    return orm ? ResumeMapper.toDomain(orm) : null;
  }

  async update(id: string, resume: Resume): Promise<Resume> {
    const orm = await this.toOrmEntity(resume);
    orm.id = id;
    await this.resumeRepo.save(orm);
    return this.reload(id);
  }

  private async reload(id: string): Promise<Resume> {
    const reloaded = await this.findById(id);
    if (!reloaded) {
      throw new Error(`Resume ${id} not found after save`);
    }
    return reloaded;
  }

  private async toOrmEntity(resume: Resume): Promise<ResumeOrmEntity> {
    const orm = new ResumeOrmEntity();
    orm.id = resume.id;
    orm.userId = resume.userId;
    orm.title = resume.title;
    orm.summary = resume.summary;

    orm.workExperiences = resume.workExperiences.map((we) => {
      const entity = new WorkExperienceOrmEntity();
      entity.id = we.id;
      entity.companyName = we.companyName;
      entity.position = we.position;
      entity.startDate = toDateOnly(we.startDate);
      entity.endDate = we.endDate ? toDateOnly(we.endDate) : null;
      entity.isCurrent = we.isCurrent;
      entity.description = we.description;
      return entity;
    });

    orm.education = resume.education.map((ed) => {
      const entity = new EducationOrmEntity();
      entity.id = ed.id;
      entity.institution = ed.institution;
      entity.degree = ed.degree;
      entity.fieldOfStudy = ed.fieldOfStudy;
      entity.startDate = toDateOnly(ed.startDate);
      entity.endDate = ed.endDate ? toDateOnly(ed.endDate) : null;
      return entity;
    });

    orm.resumeSkills = await Promise.all(
      resume.skills.map(async (s) => {
        const skill = await this.findOrCreateSkill(s.name);
        const entity = new ResumeSkillOrmEntity();
        entity.skillId = skill.id;
        entity.skill = skill;
        entity.proficiencyLevel = s.proficiencyLevel;
        return entity;
      }),
    );

    return orm;
  }

  private async findOrCreateSkill(name: string): Promise<SkillOrmEntity> {
    const normalizedName = name.trim().toLowerCase();
    const existing = await this.skillRepo.findOne({ where: { normalizedName } });
    if (existing) {
      return existing;
    }

    const created = this.skillRepo.create({ name: name.trim(), normalizedName });
    return this.skillRepo.save(created);
  }
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
