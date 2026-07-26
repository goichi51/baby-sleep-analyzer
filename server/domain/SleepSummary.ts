import { Time } from '../Time.ts'
import { DayLog } from './DayLog.ts'
import { differenceInMinutes } from 'date-fns'

interface Summary {
  sleepingTime: number[] // 睡眠時間(h)
  awakenings: number // 覚醒回数
  awakeningTime: number[] // 覚醒時間(h)
}

export class SleepSummary {
  private summary: Summary | null = null

  constructor(
    private log: DayLog,
    private startAt: Date,
    private endAt: Date,
  ) {}

  /*
    startAt から endAt の間の睡睡を要約する
    例）22:00から翌6:00のスコアを計算するとする
    1:00~1:30, 5:00~6:00 に覚醒した場合
    sleepingTime: [3, 3.5]
    awakenings: 2
    awakeningTime: [0.5, 1]
  */
  public summarize() {
    if (this.summary !== null) {
      return this.summary
    }
    const nightEvents = this.log.events.filter((e) => Time.isNightTime(e.datetime))

    if (nightEvents.length == 0) {
      const sleepingTime = [differenceInMinutes(this.endAt, this.startAt) / 60]
      this.summary = {
        sleepingTime,
        awakenings: 0,
        awakeningTime: [],
      }
      return this.summary
    }

    // sleepTime, awakengTime, awakenings の計算
    let sleepStart: Date | null = null
    let sleepEnd: Date | null = null

    const sleepingTime = []
    let awakenings = 0
    const awakeningTime = []
    nightEvents.forEach((e) => {
      if (e.name === '起きる') {
        if (sleepStart === null) {
          // 寝はじめたのが startAt 以前
          sleepingTime.push(differenceInMinutes(e.datetime, this.startAt) / 60)
        } else {
          sleepingTime.push(differenceInMinutes(e.datetime, sleepStart) / 60)
        }
        sleepStart = null
        sleepEnd = e.datetime
        awakenings++
      }
      if (e.name === '寝る') {
        if (sleepEnd === null) {
          // 前回寝たのが startAt 以前
          awakeningTime.push(differenceInMinutes(e.datetime, this.startAt) / 60)
        } else {
          awakeningTime.push(differenceInMinutes(e.datetime, sleepEnd) / 60)
        }
        sleepStart = e.datetime
        sleepEnd = null
      }
    })

    const lastEvent = nightEvents[nightEvents.length - 1]
    if (lastEvent.name === '起きる') {
      // 寝たのは endAt 以降
      awakeningTime.push(differenceInMinutes(this.endAt, lastEvent.datetime) / 60)
    }
    if (lastEvent.name === '寝る') {
      // 起きたのは endAt 以降
      sleepingTime.push(differenceInMinutes(this.endAt, lastEvent.datetime) / 60)
    }
    this.summary = { sleepingTime, awakenings, awakeningTime }
    return this.summary
  }

  public score() {
    const { sleepingTime, awakeningTime, awakenings } = this.summarize()
    // - 各睡眠時間が長いほど（覚醒が少ないほど）高スコア
    // - 覚醒時間が短いほど高スコア
    const sleepScore = sleepingTime.reduce((prev, current) => prev + current * current, 0)
    const awakePenalty = awakeningTime.reduce((prev, current) => prev + current, 0)
    return Math.max(sleepScore * 10 - awakenings * 5 - awakePenalty * 20, 0)
  }
}
