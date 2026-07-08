import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkExperienceOrmEntity } from './work-experience.orm-entity';
import { EducationOrmEntity } from './education.orm-entity';
import { ResumeSkillOrmEntity } from './resume-skill.orm-entity';

@Entity({ name: 'resumes' })
export class ResumeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('uq_resumes_user_id', { unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @OneToMany(() => WorkExperienceOrmEntity, (we) => we.resume, {
    cascade: true,
    eager: true,
  })
  workExperiences: WorkExperienceOrmEntity[];

  @OneToMany(() => EducationOrmEntity, (education) => education.resume, {
    cascade: true,
    eager: true,
  })
  education: EducationOrmEntity[];

  @OneToMany(() => ResumeSkillOrmEntity, (resumeSkill) => resumeSkill.resume, {
    cascade: true,
    eager: true,
  })
  resumeSkills: ResumeSkillOrmEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
