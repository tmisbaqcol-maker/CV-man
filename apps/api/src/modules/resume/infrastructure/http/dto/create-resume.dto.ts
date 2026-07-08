import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateWorkExperienceDto } from './create-work-experience.dto';
import { CreateEducationDto } from './create-education.dto';
import { CreateResumeSkillDto } from './create-resume-skill.dto';

export class CreateResumeDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkExperienceDto)
  workExperiences?: CreateWorkExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  education?: CreateEducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResumeSkillDto)
  skills?: CreateResumeSkillDto[];
}
