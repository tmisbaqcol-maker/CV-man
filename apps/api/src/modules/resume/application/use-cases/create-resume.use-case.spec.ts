import {
  CreateResumeCommand,
  CreateResumeUseCase,
} from './create-resume.use-case';
import { IResumeRepository } from '../../domain/ports/resume-repository.port';
import { Resume } from '../../domain/entities/resume.entity';
import { ResumeAlreadyExistsException } from '../../domain/exceptions/resume-already-exists.exception';

describe('CreateResumeUseCase', () => {
  let useCase: CreateResumeUseCase;
  let resumeRepository: jest.Mocked<IResumeRepository>;

  const command: CreateResumeCommand = {
    userId: 'user-1',
    title: 'Senior Backend Engineer',
  };

  beforeEach(() => {
    resumeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };

    useCase = new CreateResumeUseCase(resumeRepository);
  });

  it('lanza ResumeAlreadyExistsException si el usuario ya tiene un CV', async () => {
    const existingResume = new Resume(
      'resume-1',
      command.userId,
      'CV existente',
      null,
      [],
      [],
      [],
      new Date(),
      new Date(),
    );
    resumeRepository.findByUserId.mockResolvedValue(existingResume);

    await expect(useCase.execute(command)).rejects.toThrow(
      ResumeAlreadyExistsException,
    );
    expect(resumeRepository.save).not.toHaveBeenCalled();
  });

  it('invoca a IResumeRepository.save si el usuario no tiene un CV', async () => {
    resumeRepository.findByUserId.mockResolvedValue(null);
    resumeRepository.save.mockImplementation(async (resume) => resume);

    const result = await useCase.execute(command);

    expect(resumeRepository.findByUserId).toHaveBeenCalledWith(command.userId);
    expect(resumeRepository.save).toHaveBeenCalledTimes(1);
    expect(resumeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: command.userId,
        title: command.title,
      }),
    );
    expect(result.userId).toBe(command.userId);
  });
});
