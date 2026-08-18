import { differenceInMinutes, subDays } from 'date-fns'
import { Event } from './dto/ChildcareLog.ts'
import { ClimateLog } from './dto/ClimateLog.ts'

interface Session {
  start: Date
  end: Date
  duration: number
}

class NightSummary {
  constructor(
    public sleepSession: Session[] = [], // 睡眠時間(h)
    public awakenings: number | null = null, // 覚醒回数
    public awakeSession: Session[] = [], // 覚醒時間(h)
    public total: number | null = null, // 総睡眠時間(h)
  ) { }
}

export class Summary {
  public readonly nightSummary: NightSummary | null = new NightSummary()
  public readonly score: number | null = null
  public readonly lastFeedingTime: Date | null = null
  public readonly lastSleepingTime: Date | null = null
  public readonly daySleepDuration: number | null = null
  public readonly avgTemperature: number | null = null
  public readonly haveWalk: boolean | null = null

  private static feedEvent = ['母乳', 'ミルク', '搾母乳', '離乳食']

  constructor(
    events: Event[],
    climateLog: ClimateLog[],
    public readonly nightTimeStart: Date,
    public readonly nightTimeEnd: Date,
    readonly dataExists: boolean,
  ) {
    if (!dataExists) return
    const dayEvents = this.getDayEvents(events)
    const nightEvents = this.getNightEvents(events)
    this.daySleepDuration = this.computeDaySleep(dayEvents)
    this.nightSummary = this.computeNightSleep(nightEvents)
    this.lastFeedingTime = this.computeLastFeedingTime(events)
    this.lastSleepingTime = this.computeLastSleepingTime(dayEvents, nightEvents)
    this.avgTemperature = this.computeAvgTemperature(climateLog)
    this.haveWalk = events.some(e => e.name === 'さんぽ')
    this.score = this.computeScore()
  }

  /*
    夜(22時〜6時)の睡睡を要約する
  */
  public computeNightSleep(nightEvents: Event[]) {
    if (nightEvents.length == 0) {
      const sleepSession = [
        {
          start: this.nightTimeStart,
          end: this.nightTimeEnd,
          duration: this.duration(this.nightTimeStart, this.nightTimeEnd),
        },
      ]
      return {
        sleepSession,
        awakenings: 0,
        awakeSession: [],
        total: sleepSession[0].duration,
      }
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
            duration: this.duration(this.nightTimeStart, e.datetime),
          })
        } else {
          sleepSession.push({
            start: sleepStart,
            end: e.datetime,
            duration: this.duration(sleepStart, e.datetime),
          })
        }
        sleepStart = null
        sleepEnd = e.datetime
        awakenings++
      }
      if (e.name === '寝る') {
        if (sleepEnd === null) {
          // 前回寝たのが startAt 以前
          if (e.datetime > this.nightTimeStart) {
            awakeSession.push({
              start: this.nightTimeStart,
              end: e.datetime,
              duration: this.duration(this.nightTimeStart, e.datetime),
            })
          }
        } else {
          awakeSession.push({
            start: sleepEnd,
            end: e.datetime,
            duration: this.duration(sleepEnd, e.datetime),
          })
        }
        sleepStart = e.datetime
        sleepEnd = null
      }
    })

    const lastEvent = nightEvents.findLast(e => e.name === '起きる' || e.name === '寝る')
    if (lastEvent?.name === '起きる') {
      // 寝たのは endAt 以降
      awakeSession.push({
        start: lastEvent.datetime,
        end: this.nightTimeEnd,
        duration: this.duration(lastEvent.datetime, this.nightTimeEnd),
      })
      awakenings++
    }
    if (lastEvent?.name === '寝る') {
      // 起きたのは endAt 以降
      sleepSession.push({
        start: lastEvent.datetime,
        end: this.nightTimeEnd,
        duration: this.duration(lastEvent.datetime, this.nightTimeEnd),
      })
    }
    const total = sleepSession.reduce((prev, current) => current.duration + prev, 0)
    return { sleepSession, awakenings, awakeSession, total }
  }

  /**
   * 日中の睡眠時間を要約する
   */
  public computeDaySleep(dayEvents: Event[]) {
    const dayTimeStart = subDays(this.nightTimeEnd, 1)

    if (dayEvents.length === 0) {
      return 0
    }

    let sleepStart: Date | null = null
    let duration = 0
    dayEvents.forEach((e) => {
      if (e.name === '寝る') {
        sleepStart = e.datetime
      }
      if (e.name === '起きる') {
        // 夜時間中に寝た
        if (sleepStart === null) {
          duration += this.duration(dayTimeStart, e.datetime)
        } else {
          duration += this.duration(sleepStart, e.datetime)
        }
        sleepStart = null
      }
    })
    const lastEvent = dayEvents[dayEvents.length - 1]
    if (lastEvent.name === '寝る') {
      // 起きたのは夜時間
      duration += this.duration(lastEvent.datetime, this.nightTimeStart)
    }
    return duration
  }

  /**
   * 夜の睡眠前の最後の授乳の時間を返す
   * @returns 最後の授乳時間
   */
  public computeLastFeedingTime(events: Event[]) {
    // TODO length=0となる場合について
    if (this.nightSummary === null || this.nightSummary.sleepSession.length === 0) return null
    const firstSleepStart = this.nightSummary.sleepSession[0].start
    const event = events.findLast(
      (e) => e.datetime < firstSleepStart && Summary.feedEvent.includes(e.name),
    )
    if (event === undefined) {
      // TODO 前日のデータがない
      console.error('no feeding event')
      return null
    }
    return event.datetime
  }

  public computeLastSleepingTime(dayEvents: Event[], nightEvents: Event[]) {
    if (this.nightSummary === null || this.nightSummary.sleepSession.length === 0) return null
    // 夜時間開始時点で寝ていた場合
    if (this.nightSummary.sleepSession[0].start === this.nightTimeStart) {
      const e = nightEvents.find((e) => e.name === '寝る')
      // 夜時間開始ぴったりで寝た
      if (e?.datetime === this.nightTimeStart) {
        return e?.datetime
      }
      // 夜時間前に寝ていた
      const lastSleepStart = dayEvents.findLast((e) => e.name === '寝る')
      // TODO 前日データがない場合
      return lastSleepStart?.datetime
    }
    // 夜時間開始時点で寝ていなかった場合
    return this.nightSummary.sleepSession[0].start
  }

  public computeAvgTemperature(log: ClimateLog[]) {
    const filtered = log
      .filter(l => this.nightTimeStart <= l.datetime && l.datetime < this.nightTimeEnd)
    return filtered.reduce((prev, current) => prev + current.temperature, 0) / filtered.length
  }

  /**
   * 睡眠のスコアを計算する
   * - 各睡眠時間が長いほど（覚醒が少ないほど）高スコア
   * - 覚醒時間が短いほど高スコア
   * @returns スコア
   */
  public computeScore() {
    if (this.nightSummary === null) return null
    const { sleepSession, awakeSession, awakenings } = this.nightSummary
    const sleepScore = sleepSession.reduce(
      (prev, current) => prev + current.duration * current.duration,
      0,
    )
    const awakePenalty = awakeSession.reduce((prev, current) => prev + current.duration, 0)

    // スコアを100点満点にするために、スコアの最大値を計算して割る
    const maxDuration = this.duration(this.nightTimeStart, this.nightTimeEnd)
    const maxScore = maxDuration * maxDuration * 10
    return this.normalize(sleepScore * 10 - awakenings * 5 - awakePenalty * 20, maxScore)
  }

  private duration(start: Date, end: Date) {
    return differenceInMinutes(end, start) / 60
  }

  /**
   * 日中のイベントを一覧取得する
   * @param events
   */
  private getDayEvents(events: Event[]) {
    const dayTimeStart = subDays(this.nightTimeEnd, 1)
    const dayTimeEnd = this.nightTimeStart
    return events.filter((e) => dayTimeStart <= e.datetime && e.datetime < dayTimeEnd)
  }

  /**
   * 夜間のイベントを一覧取得する
   * @returns events
   */
  private getNightEvents(events: Event[]) {
    return events.filter(
      (e) => this.nightTimeStart <= e.datetime && e.datetime < this.nightTimeEnd,
    )
  }

  /**
   * スコアを0~100点にする
   */
  private normalize(n: number, maxScore: number) {
    return Math.floor((Math.max(n, 0) / maxScore) * 100)
  }
}
