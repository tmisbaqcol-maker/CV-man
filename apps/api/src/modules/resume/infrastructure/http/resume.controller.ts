import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateResumeUseCase } from '../../application/use-cases/create-resume.use-case';
import { ResumeAlreadyExistsException } from '../../domain/exceptions/resume-already-exists.exception';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { ResumeResponseMapper } from './mappers/resume-response.mapper';

@ApiTags('resumes')
@Controller('resumes')
export class ResumeController {
  constructor(private readonly createResumeUseCase: CreateResumeUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Crea el CV de un usuario' })
  @ApiResponse({ status: 201, description: 'CV creado', type: ResumeResponseDto })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene un CV' })
  async create(@Body() dto: CreateResumeDto): Promise<ResumeResponseDto> {
    try {
      const resume = await this.createResumeUseCase.execute({
        userId: dto.userId,
        title: dto.title,
        summary: dto.summary,
        workExperiences: dto.workExperiences?.map((we) => ({
          companyName: we.companyName,
          position: we.position,
          startDate: new Date(we.startDate),
          endDate: we.endDate ? new Date(we.endDate) : null,
          isCurrent: we.isCurrent,
          description: we.description,
        })),
        education: dto.education?.map((ed) => ({
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          startDate: new Date(ed.startDate),
          endDate: ed.endDate ? new Date(ed.endDate) : null,
        })),
        skills: dto.skills?.map((s) => ({
          name: s.name,
          proficiencyLevel: s.proficiencyLevel,
        })),
      });

      return ResumeResponseMapper.toResponse(resume);
    } catch (error) {
      if (error instanceof ResumeAlreadyExistsException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
