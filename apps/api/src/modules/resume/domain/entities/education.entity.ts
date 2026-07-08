export class Education {
  constructor(
    public readonly id: string,
    public institution: string,
    public degree: string,
    public fieldOfStudy: string | null,
    public startDate: Date,
    public endDate: Date | null,
  ) {}
}
