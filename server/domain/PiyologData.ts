import { Diary } from './dto/Diary.ts'
import { Event } from './dto/Event.ts'

/**
 * 1日分のぴよろぐデータ
 */
export class PiyologData {
  constructor(
    public events: Event[],
    public diary: Diary | null,
  ) {}
}
