import { Diary } from './Diary.ts'
import { Event } from './Event.ts'

/**
 * 1日分のぴよろぐデータ
 */
export class ChildcareLog {
  constructor(
    public events: Event[],
    public diary: Diary | null,
  ) {}
}
