export class Event {
  constructor(
    public name: string,
    public datetime: Date,
    public memo?: string,
  ) { }
}

export class Diary {
  constructor(
    public text: string,
    public date: Date,
  ) { }
}

/**
 * 1日分のぴよろぐデータ
 */
export class ChildcareLog {
  constructor(
    public events: Event[],
    public diary: Diary | null,
  ) { }
}
