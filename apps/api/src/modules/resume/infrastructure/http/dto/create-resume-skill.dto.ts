import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateResumeSkillDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  proficiencyLevel?: number;
}
