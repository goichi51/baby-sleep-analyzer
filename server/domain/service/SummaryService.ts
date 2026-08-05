import { format, startOfDay } from 'date-fns'
import { CustomDate } from '../../CustomDate.ts'
import { EventRepository } from '../../repository/EventRepository.ts'
import { Summary } from '../Summary.ts'
import { Ranking } from '../dto/Ranking.ts'
import { Score } from '../dto/Score.ts'

export class SummaryService {
  constructor(private repo: EventRepository) {}

  /**
   * 指定された期間の睡眠情報の要約を返す.
   * 睡眠情報は朝6時を基準とした1日ごとに要約される
   *
   * @param since 取得開始日
   * @param until 取得終了日
   * @returns Summary
   */
  public async findByDate(since: Date, until: Date) {
    const customDateSince = CustomDate.getDayRange(since).start
    const customDateUntil = CustomDate.getDayRange(until).end
    const events = await this.repo.findByDateRange(customDateSince, customDateUntil)
    // 朝6時を基準とした日付でグルーピング
    const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
      format(CustomDate.getDate(datetime), 'yyyy-MM-dd'),
    )
    return Array.from(
      dateEventsMap.entries().map(([date, events]) => {
        const { start, end } = CustomDate.getNightTime(date)
        return new Summary(events, start, end)
      }),
    )
  }

  public async getRanking(since: Date, until: Date, num: number) {
    const summaries = await this.findByDate(new Date(since), new Date(until))
    const sorted = summaries.sort((a, b) => {
      if (!a.score || !b.score) return 0
      return b.score - a.score
    })
    return new Ranking(sorted.slice(0, Number(num)), sorted.toReversed().slice(0, Number(num)))
  }

  public async getScores(since: Date, until: Date) {
    const summaries = await this.findByDate(new Date(since), new Date(until))
    return summaries.map((summary) => new Score(startOfDay(summary.nightTimeStart), summary.score))
  }
}
