import { MySql2Database } from 'drizzle-orm/mysql2'
import { DiaryRepository } from '../../repository/DiaryRepository.ts'
import { StateRepository } from '../../repository/StateRepository.ts'
import { StateCollection } from '../dto/State.ts'
import { EventRepository } from '../../repository/EventRepository.ts'
import { CustomDate } from '../../CustomDate.ts'
import { startOfDay } from 'date-fns'
import { ChildcareLogCollection } from '../ChildcareLogCollection.ts'
import { ChildcareLog } from '../ChildCareLog.ts'

export class LogService {
  constructor(
    private eventRepo: EventRepository,
    private diaryRepo: DiaryRepository,
    private stateRepo: StateRepository,
    private db: MySql2Database,
  ) {}

  public async create(text: string) {
    const parsed = ChildcareLogCollection.create(text)
    const { since, until } = parsed.getRange()
    await this.db.transaction(async (tx) => {
      const eventPromise = this.eventRepo
        .delete(since, until, tx)
        .then(() => this.eventRepo.insert(parsed.events, tx))
      const diaryPromise = this.diaryRepo
        .delete(since, until, tx)
        .then(() => this.diaryRepo.insert(parsed.diary, tx))
      const statePromise = this.stateRepo.insert(
        new StateCollection(since, until, 'childcare').states,
      )
      await Promise.all([eventPromise, diaryPromise, statePromise])
    })
  }

  public async findByDate(date: Date) {
    const { start, end } = CustomDate.getDayRange(date)
    const [events, diary] = await Promise.all([
      this.eventRepo.findByDateRange(start, end),
      this.diaryRepo.findByDate(startOfDay(date)),
    ])
    if (events.length === 0) {
      return null
    }
    return new ChildcareLog(events, diary.length > 0 ? diary[0] : null)
  }
}
