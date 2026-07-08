import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ResumeOrmEntity } from './resume.orm-entity';

@Entity({ name: 'education' })
export class EducationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_education_resume_id')
  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId: string;

  @ManyToOne(() => ResumeOrmEntity, (resume) => resume.education, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: ResumeOrmEntity;

  @Column({ type: 'varchar', length: 255 })
  institution: string;

  @Column({ type: 'varchar', length: 255 })
  degree: string;

  @Column({
    name: 'field_of_study',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fieldOfStudy: string | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
