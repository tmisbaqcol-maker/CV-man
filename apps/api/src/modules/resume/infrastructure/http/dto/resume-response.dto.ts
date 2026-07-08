export class WorkExperienceResponseDto {
  id: string;
  companyName: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
}

export class EducationResponseDto {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: Date;
  endDate: Date | null;
}

export class ResumeSkillResponseDto {
  skillId: string;
  name: string;
  proficiencyLevel: number | null;
}

export class ResumeResponseDto {
  id: string;
  userId: string;
  title: string;
  summary: string | null;
  workExperiences: WorkExperienceResponseDto[];
  education: EducationResponseDto[];
  skills: ResumeSkillResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
