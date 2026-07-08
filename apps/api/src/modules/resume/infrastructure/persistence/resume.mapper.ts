import { Resume } from '../../domain/entities/resume.entity';
import { WorkExperience } from '../../domain/entities/work-experience.entity';
import { Education } from '../../domain/entities/education.entity';
import { ResumeSkill } from '../../domain/entities/resume-skill.entity';
import { ResumeOrmEntity } from './orm-entities/resume.orm-entity';

export class ResumeMapper {
  static toDomain(orm: ResumeOrmEntity): Resume {
    return new Resume(
      orm.id,
      orm.userId,
      orm.title,
      orm.summary,
      (orm.workExperiences ?? []).map(
        (we) =>
          new WorkExperience(
            we.id,
            we.companyName,
            we.position,
            new Date(we.startDate),
            we.endDate ? new Date(we.endDate) : null,
            we.isCurrent,
            we.description,
          ),
      ),
      (orm.education ?? []).map(
        (ed) =>
          new Education(
            ed.id,
            ed.institution,
            ed.degree,
            ed.fieldOfStudy,
            new Date(ed.startDate),
            ed.endDate ? new Date(ed.endDate) : null,
          ),
      ),
      (orm.resumeSkills ?? []).map(
        (rs) =>
          new ResumeSkill(rs.skillId, rs.skill?.name ?? '', rs.proficiencyLevel),
      ),
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
