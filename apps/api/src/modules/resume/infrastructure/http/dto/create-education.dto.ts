import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @MaxLength(255)
  institution: string;

  @IsString()
  @MaxLength(255)
  degree: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fieldOfStudy?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
