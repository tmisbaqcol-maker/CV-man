import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateResumeUseCase } from './application/use-cases/create-resume.use-case';
import { RESUME_REPOSITORY } from './domain/ports/resume-repository.port';
import { ResumeTypeOrmRepository } from './infrastructure/persistence/resume-typeorm.repository';
import { ResumeOrmEntity } from './infrastructure/persistence/orm-entities/resume.orm-entity';
import { WorkExperienceOrmEntity } from './infrastructure/persistence/orm-entities/work-experience.orm-entity';
import { EducationOrmEntity } from './infrastructure/persistence/orm-entities/education.orm-entity';
import { SkillOrmEntity } from './infrastructure/persistence/orm-entities/skill.orm-entity';
import { ResumeSkillOrmEntity } from './infrastructure/persistence/orm-entities/resume-skill.orm-entity';
import { ResumeController } from './infrastructure/http/resume.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResumeOrmEntity,
      WorkExperienceOrmEntity,
      EducationOrmEntity,
      SkillOrmEntity,
      ResumeSkillOrmEntity,
    ]),
  ],
  controllers: [ResumeController],
  providers: [
    CreateResumeUseCase,
    { provide: RESUME_REPOSITORY, useClass: ResumeTypeOrmRepository },
  ],
})
export class ResumeModule {}
