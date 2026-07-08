export class ResumeAlreadyExistsException extends Error {
  constructor(userId: string) {
    super(`User ${userId} already has a resume`);
    this.name = 'ResumeAlreadyExistsException';
  }
}
