import { MySql2Database } from 'drizzle-orm/mysql2'
import { DiaryRepository } from '../../repository/DiaryRepository.ts'
import { StateRepository } from '../../repository/StateRepository.ts'
import { StateCollection } from '../dto/StateCollection.ts'
import { EventRepository } from '../../repository/EventRepository.ts'
import { CustomDate } from '../../CustomDate.ts'
import { addHours, format, startOfDay } from 'date-fns'
import { ChildcareLogCollection } from '../ChildcareLogCollection.ts'
import { ChildcareLog } from '../dto/ChildcareLog.ts'
import { ClimateLogRepository } from '../../repository/ClimateLogRepository.ts'
import { ClimateLogCollection } from '../ClimateLogCollection.ts'

export class LogService {
  constructor(
    private eventRepo: EventRepository,
    private diaryRepo: DiaryRepository,
    private stateRepo: StateRepository,
    private climateLogRepo: ClimateLogRepository,
    private db: MySql2Database,
  ) { }

  public async createChildcareLog(text: string) {
    const parsed = ChildcareLogCollection.create(text)
    const { since, until } = parsed.getPeriod()
    await this.db.transaction(async (tx) => {
      const eventPromise = this.eventRepo
        .delete(since, until, tx)
        .then(() => this.eventRepo.insert(parsed.events, tx))
      const diaryPromise = this.diaryRepo
        .delete(since, until, tx)
        .then(() => this.diaryRepo.insert(parsed.diary, tx))
      const statePromise = this.stateRepo
        .delete(since, until, 'childcare', tx)
        .then(() => this.stateRepo.insert(new StateCollection(since, until, 'childcare').states, tx)
        )
      await Promise.all([eventPromise, diaryPromise, statePromise])
      console.info(`Import childcare logs for the period from ${format(since, 'yyyy-MM-dd hh:mm')} to ${format(until, 'yyyy-MM-dd hh:mm')}`)
    })
  }

  public async createClimateLog(text: string) {
    const parsed = ClimateLogCollection.create(text)
    const { since, until } = parsed.getPeriod()
    await this.db.transaction(async (tx) => {
      const logPromise = this.climateLogRepo
        .delete(since, until, tx)
        .then(() => this.climateLogRepo.insert(parsed.logs, tx))
      const statePromise = this.stateRepo
        .delete(since, until, 'climate', tx)
        .then(() => this.stateRepo.insert(
          new StateCollection(since, until, 'climate').states,
          tx
        ))
      await Promise.all([logPromise, statePromise])
      console.info(`Import climate logs for the period from ${format(since, 'yyyy-MM-dd hh:mm')} to ${format(until, 'yyyy-MM-dd hh:mm')}`)
    })
  }

  public async findChildcareLogByDate(date: Date) {
    const { start, end } = CustomDate.getDayPeriod(date)
    const [events, diary] = await Promise.all([
      this.eventRepo.findByDateRange(start, end),
      this.diaryRepo.findByDate(startOfDay(date)),
    ])
    if (events.length === 0) {
      return null
    }
    return new ChildcareLog(events, diary.length > 0 ? diary[0] : null)
  }

  public async findNightClimateLogByDate(date: Date) {
    const { start, end } = CustomDate.getNightTime(date)
    // 表示の都合上 end まで含めて取るようにする
    const logs = await this.climateLogRepo.findByDateRange(start, addHours(end, 1))
    if (logs.length === 0) {
      return null
    }
    return logs
  }
}
