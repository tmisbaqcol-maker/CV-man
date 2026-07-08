export class WorkExperience {
  constructor(
    public readonly id: string,
    public companyName: string,
    public position: string,
    public startDate: Date,
    public endDate: Date | null,
    public isCurrent: boolean,
    public description: string | null,
  ) {}
}
