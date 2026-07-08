export class ResumeSkill {
  constructor(
    public readonly skillId: string,
    public name: string,
    public proficiencyLevel: number | null,
  ) {}
}
