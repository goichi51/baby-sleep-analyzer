import { DayLog } from './DayLog.ts'
import { differenceInMinutes } from 'date-fns'

interface Session {
  start: Date
  end: Date
  duration: number
}

interface Summary {
  sleepSession: Session[] // 睡眠時間(h)
  awakenings: number // 覚醒回数
  awakeSession: Session[] // 覚醒時間(h)
}

export class SleepSummary {
  private summary: Summary | null = null

  constructor(
    private log: DayLog,
    private nightTimeStart: Date,
    private nightTimeEnd: Date,
  ) {}

  /*
    nightTimeStart から nightTimeEnd の間の睡睡を要約する
  */
  public summarize() {
    if (this.summary !== null) {
      return this.summary
    }
    const nightEvents = this.log.events.filter(
      (e) => this.nightTimeStart <= e.datetime && e.datetime < this.nightTimeEnd,
    )
    if (nightEvents.length == 0) {
      const sleepSession = [
        {
          start: this.nightTimeStart,
          end: this.nightTimeEnd,
          duration: differenceInMinutes(this.nightTimeEnd, this.nightTimeStart) / 60,
        },
      ]
      this.summary = {
        sleepSession,
        awakenings: 0,
        awakeSession: [],
      }
      return this.summary
    }

    // sleepSession, awakeSession, awakenings の計算
    let sleepStart: Date | null = null
    let sleepEnd: Date | null = null

    const sleepSession = []
    let awakenings = 0
    const awakeSession = []
    nightEvents.forEach((e) => {
      if (e.name === '起きる') {
        if (sleepStart === null) {
          // 寝はじめたのが startAt 以前
          sleepSession.push({
            start: this.nightTimeStart,
            end: e.datetime,
            duration: differenceInMinutes(e.datetime, this.nightTimeStart) / 60,
          })
        } else {
          sleepSession.push({
            start: sleepStart,
            end: e.datetime,
            duration: differenceInMinutes(e.datetime, sleepStart) / 60,
          })
        }
        sleepStart = null
        sleepEnd = e.datetime
        awakenings++
      }
      if (e.name === '寝る') {
        if (sleepEnd === null) {
          // 前回寝たのが startAt 以前
          awakeSession.push({
            start: this.nightTimeStart,
            end: e.datetime,
            duration: differenceInMinutes(e.datetime, this.nightTimeStart) / 60,
          })
        } else {
          awakeSession.push({
            start: sleepEnd,
            end: e.datetime,
            duration: differenceInMinutes(e.datetime, sleepEnd) / 60,
          })
        }
        sleepStart = e.datetime
        sleepEnd = null
      }
    })

    const lastEvent = nightEvents[nightEvents.length - 1]
    if (lastEvent.name === '起きる') {
      // 寝たのは endAt 以降
      awakeSession.push({
        start: lastEvent.datetime,
        end: this.nightTimeEnd,
        duration: differenceInMinutes(this.nightTimeEnd, lastEvent.datetime) / 60,
      })
      awakenings++
    }
    if (lastEvent.name === '寝る') {
      // 起きたのは endAt 以降
      sleepSession.push({
        start: lastEvent.datetime,
        end: this.nightTimeEnd,
        duration: differenceInMinutes(this.nightTimeEnd, lastEvent.datetime) / 60,
      })
    }
    this.summary = { sleepSession, awakenings, awakeSession }
    return this.summary
  }

  /**
   * 睡眠のスコアを計算する
   * - 各睡眠時間が長いほど（覚醒が少ないほど）高スコア
   * - 覚醒時間が短いほど高スコア
   * @returns スコア
   */
  public score() {
    const { sleepSession, awakeSession, awakenings } = this.summarize()
    const sleepScore = sleepSession.reduce(
      (prev, current) => prev + current.duration * current.duration,
      0,
    )
    const awakePenalty = awakeSession.reduce((prev, current) => prev + current.duration, 0)
    return Math.max(sleepScore * 10 - awakenings * 5 - awakePenalty * 20, 0)
  }
}
