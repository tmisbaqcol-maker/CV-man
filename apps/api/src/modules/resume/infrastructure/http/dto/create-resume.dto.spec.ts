import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateResumeDto } from './create-resume.dto';

describe('CreateResumeDto validation', () => {
  it('rejects an empty payload with errors on the required fields', async () => {
    const dto = plainToInstance(CreateResumeDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const invalidProperties = errors.map((e) => e.property);
    expect(invalidProperties).toEqual(expect.arrayContaining(['userId', 'title']));
  });

  it('accepts a valid minimal payload', async () => {
    const dto = plainToInstance(CreateResumeDto, {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Backend Engineer',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
