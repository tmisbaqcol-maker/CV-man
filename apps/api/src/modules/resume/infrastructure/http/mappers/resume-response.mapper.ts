import { Resume } from '../../../domain/entities/resume.entity';
import { ResumeResponseDto } from '../dto/resume-response.dto';

export class ResumeResponseMapper {
  static toResponse(resume: Resume): ResumeResponseDto {
    return {
      id: resume.id,
      userId: resume.userId,
      title: resume.title,
      summary: resume.summary,
      workExperiences: resume.workExperiences,
      education: resume.education,
      skills: resume.skills,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }
}
