import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ResumeOrmEntity } from './resume.orm-entity';
import { SkillOrmEntity } from './skill.orm-entity';

@Entity({ name: 'resume_skills' })
export class ResumeSkillOrmEntity {
  @PrimaryColumn({ name: 'resume_id', type: 'uuid' })
  resumeId: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => ResumeOrmEntity, (resume) => resume.resumeSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: ResumeOrmEntity;

  @Index('idx_resume_skills_skill_id')
  @ManyToOne(() => SkillOrmEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillOrmEntity;

  @Column({ name: 'proficiency_level', type: 'smallint', nullable: true })
  proficiencyLevel: number | null;
}
