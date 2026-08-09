export class Event {
  constructor(
    public name: string,
    public datetime: Date,
    public memo?: string,
  ) {}
}
