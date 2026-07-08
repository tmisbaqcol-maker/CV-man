import { WorkExperience } from './work-experience.entity';
import { Education } from './education.entity';
import { ResumeSkill } from './resume-skill.entity';

export class Resume {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public summary: string | null,
    public workExperiences: WorkExperience[],
    public education: Education[],
    public skills: ResumeSkill[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
