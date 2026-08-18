import { format, startOfDay } from 'date-fns'
import { CustomDate } from '../../CustomDate.ts'
import { EventRepository } from '../../repository/EventRepository.ts'
import { Summary } from '../Summary.ts'
import { StateRepository } from '../../repository/StateRepository.ts'
import { ClimateLogRepository } from '../../repository/ClimateLogRepository.ts'

export class SummaryService {
  constructor(
    private eventRepo: EventRepository,
    private climateLogRepo: ClimateLogRepository,
    private stateRepo: StateRepository,
  ) { }

  /**
   * 指定された期間の睡眠情報の要約を返す.
   * 睡眠情報は朝6時を基準とした1日ごとに要約される
   *
   * @param since 取得開始日
   * @param until 取得終了日
   * @returns Summary
   */
  public async findByDate(since: Date, until: Date) {
    const customDateSince = CustomDate.getDayPeriod(since).start
    const customDateUntil = CustomDate.getDayPeriod(until).end

    const events = await this.eventRepo.findByDateRange(customDateSince, customDateUntil)
    const climateLog = await this.climateLogRepo.findByDateRange(customDateSince, customDateUntil)
    const states = await this.stateRepo.findByDateRange(
      startOfDay(customDateSince),
      customDateUntil,
    )
    // 朝6時を基準とした日付でグルーピング
    const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
      format(CustomDate.getDate(datetime), 'yyyy-MM-dd'),
    )
    const dateClimateLogMap = Map.groupBy(climateLog, ({ datetime }) =>
      format(CustomDate.getDate(datetime), 'yyyy-MM-dd'))
    const dateStatesMap = Map.groupBy(states, ({ date }) => format(date, 'yyyy-MM-dd'))
    return Array.from(
      dateEventsMap.entries().map(([date, events]) => {
        const { start, end } = CustomDate.getNightTime(date)
        const dataExists =
          dateStatesMap.get(format(start, 'yyyy-MM-dd')) != undefined &&
          dateStatesMap.get(format(end, 'yyyy-MM-dd')) != undefined
        return new Summary(events, climateLog, start, end, dataExists)
      }),
    )
  }
}
