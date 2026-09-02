import { describe, test, expect } from 'vitest'
import { Event } from './dto/ChildcareLog.ts'
import { Summary } from './Summary.ts'

const startAt = new Date('2026-07-25T22:00:00Z')
const endAt = new Date('2026-07-26T06:00:00Z')

describe('computeDaySleep', () => {
  test('昼時間の睡眠時間の総和が計算される', () => {
    const events: Event[] = [
      // 夜の睡眠に含まれるため6:00-6:30はカウントしない
      { name: '起きる', datetime: new Date('2026-07-25T06:30:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T09:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-25T11:00:00Z') },
      { name: '母乳', datetime: new Date('2026-07-25T11:30:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T14:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-25T16:00:00Z') },
      // 夜の睡眠に含まれるため、20:00-22:00はカウントしない
      { name: '寝る', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T23:30:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.daySleepDuration).toEqual(3.5)
  })
})

describe('computeNightSleep', () => {
  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒あり)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '母乳', datetime: new Date('2026-07-26T01:10:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T04:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T05:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T07:00:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.nightSummary?.sleepSession).toEqual([
      {
        start: new Date('2026-07-25T22:00:00Z'),
        end: new Date('2026-07-26T01:00:00Z'),
        duration: 3,
      },
      {
        start: new Date('2026-07-26T01:30:00Z'),
        end: new Date('2026-07-26T04:00:00Z'),
        duration: 2.5,
      },
      {
        start: new Date('2026-07-26T05:00:00Z'),
        end: new Date('2026-07-26T06:00:00Z'),
        duration: 1,
      },
    ])
    expect(summary.nightSummary?.awakeSession).toEqual([
      {
        start: new Date('2026-07-26T01:00:00Z'),
        end: new Date('2026-07-26T01:30:00Z'),
        duration: 0.5,
      },
      {
        start: new Date('2026-07-26T04:00:00Z'),
        end: new Date('2026-07-26T05:00:00Z'),
        duration: 1,
      },
    ])
    expect(summary.nightSummary?.awakenings).toEqual(2)
  })

  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒なし)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T07:00:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.nightSummary?.sleepSession).toEqual([
      {
        start: new Date('2026-07-25T22:00:00Z'),
        end: new Date('2026-07-26T06:00:00Z'),
        duration: 8,
      },
    ])
    expect(summary.nightSummary?.awakenings).toEqual(0)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒あり)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
      { name: 'ミルク', datetime: new Date('2026-07-26T05:20:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.nightSummary?.sleepSession).toEqual([
      {
        start: new Date('2026-07-25T23:00:00Z'),
        end: new Date('2026-07-26T01:00:00Z'),
        duration: 2,
      },
      {
        start: new Date('2026-07-26T01:30:00Z'),
        end: new Date('2026-07-26T05:00:00Z'),
        duration: 3.5,
      },
    ])
    expect(summary.nightSummary?.awakeSession).toEqual([
      {
        start: new Date('2026-07-25T22:00:00Z'),
        end: new Date('2026-07-25T23:00:00Z'),
        duration: 1,
      },
      {
        start: new Date('2026-07-26T01:00:00Z'),
        end: new Date('2026-07-26T01:30:00Z'),
        duration: 0.5,
      },
      {
        start: new Date('2026-07-26T05:00:00Z'),
        end: new Date('2026-07-26T06:00:00Z'),
        duration: 1,
      },
    ])
    expect(summary.nightSummary?.awakenings).toEqual(3)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒なし)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.nightSummary?.sleepSession).toEqual([
      {
        start: new Date('2026-07-25T23:00:00Z'),
        end: new Date('2026-07-26T05:00:00Z'),
        duration: 6,
      },
    ])
    expect(summary.nightSummary?.awakeSession).toEqual([
      {
        start: new Date('2026-07-25T22:00:00Z'),
        end: new Date('2026-07-25T23:00:00Z'),
        duration: 1,
      },
      {
        start: new Date('2026-07-26T05:00:00Z'),
        end: new Date('2026-07-26T06:00:00Z'),
        duration: 1,
      },
    ])
    expect(summary.nightSummary?.awakenings).toEqual(2)
  })
})

describe('computeLastFeedingTime', () => {
  test('夜時間前に寝た', () => {
    const events: Event[] = [
      { name: 'ミルク', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.lastFeedingTime).toEqual(new Date('2026-07-25T20:00:00Z'))
  })

  test('夜時間開始時に寝た', () => {
    const events: Event[] = [
      { name: 'ミルク', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T22:00:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.lastFeedingTime).toEqual(new Date('2026-07-25T20:00:00Z'))
  })

  test('夜時間後に寝た', () => {
    const events: Event[] = [
      { name: '母乳', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
    ]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.lastFeedingTime).toEqual(new Date('2026-07-25T21:00:00Z'))
  })
})

describe('computeLastSleepingTime', () => {
  test('夜時間前に寝た', () => {
    const events: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') }]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.lastSleepingTime).toEqual(new Date('2026-07-25T21:00:00Z'))
  })

  test('夜時間開始時に寝た', () => {
    const events: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T22:00:00Z') }]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.lastSleepingTime).toEqual(new Date('2026-07-25T22:00:00Z'))
  })

  test('夜時間後に寝た', () => {
    const events: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') }]
    const summary = new Summary(events, [], startAt, endAt, true)
    expect(summary.lastSleepingTime).toEqual(new Date('2026-07-25T23:00:00Z'))
  })
})

describe('computeAvgTemperature', () => {
  test('平均気温を計算する', () => {
    const events: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') }]
    const data = [
      { datetime: new Date('2026-07-25T21:00:00Z'), temperature: 20, humidity: 50 },
      { datetime: new Date('2026-07-25T22:00:00Z'), temperature: 24, humidity: 50 },
      { datetime: new Date('2026-07-25T23:00:00Z'), temperature: 24, humidity: 50 },
      { datetime: new Date('2026-07-26T00:00:00Z'), temperature: 26, humidity: 50 },
      { datetime: new Date('2026-07-26T02:00:00Z'), temperature: 24, humidity: 50 },
      { datetime: new Date('2026-07-26T03:00:00Z'), temperature: 22, humidity: 50 },
      { datetime: new Date('2026-07-26T04:00:00Z'), temperature: 20, humidity: 50 },
      { datetime: new Date('2026-07-26T05:00:00Z'), temperature: 22, humidity: 50 },
      { datetime: new Date('2026-07-26T06:00:00Z'), temperature: 24, humidity: 50 },
    ]
    const summary = new Summary(events, data, startAt, endAt, true)
    expect(summary.avgTemperature).toEqual(23.25)
  })
})

describe('computeScore', () => {
  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒あり)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T04:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T05:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T07:00:00Z') },
    ]
    expect(new Summary(events, [], startAt, endAt, true).score).toEqual(19)
  })

  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒なし)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T07:00:00Z') },
    ]
    expect(new Summary(events, [], startAt, endAt, true).score).toEqual(100)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒あり）', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    expect(new Summary(events, [], startAt, endAt, true).score).toEqual(15)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒なし）', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    expect(new Summary(events, [], startAt, endAt, true).score).toEqual(48)
  })

  test('総睡眠時間が同じでも覚醒回数が少ないほうがスコアが高い', () => {
    // 2回覚醒（低スコア）
    const badSleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T22:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:30:00Z') },
    ]
    const badSleepScore = new Summary(badSleepEvents, [], startAt, endAt, true).score

    // 1回覚醒（高スコア）
    const goodSleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
    ]
    const goodSleepScore = new Summary(goodSleepEvents, [], startAt, endAt, true).score

    expect(badSleepScore).toBeLessThan(goodSleepScore!)
  })

  test('総睡眠時間が同じでも長い睡眠睡眠ブロックがあるほうがスコアが高い', () => {
    // 総睡眠時間のちょうど半分で覚醒（低スコア）
    const badSleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:05:00Z') },
    ]
    const badSleepScore = new Summary(badSleepEvents, [], startAt, endAt, true).score

    // 前半の睡眠が長くとれた（中程度のスコア）
    const sleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T20:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T05:05:00Z') },
    ]
    const sleepScore = new Summary(sleepEvents, [], startAt, endAt, true).score

    // 中途覚醒なし（高スコア）
    const goodSleepEvents: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T22:05:00Z') }]
    const goodSleepScore = new Summary(goodSleepEvents, [], startAt, endAt, true).score

    expect(badSleepScore).toBeLessThan(sleepScore!)
    expect(sleepScore).toBeLessThan(goodSleepScore!)
  })

  test('覚醒回数がおなじでも覚醒時間が少ない方がスコアが高い', () => {
    // 覚醒が長い（低スコア）
    const badSleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:10:00Z') },
    ]
    const badSleepScore = new Summary(badSleepEvents, [], startAt, endAt, true).score

    // 中程度の覚醒（中程度のスコア）
    const sleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:05:00Z') },
    ]
    const sleepScore = new Summary(sleepEvents, [], startAt, endAt, true).score

    // 覚醒時間が短い（高スコア）
    const goodSleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T21:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:01:00Z') },
    ]
    const goodSleepScore = new Summary(goodSleepEvents, [], startAt, endAt, true).score

    expect(badSleepScore).toBeLessThan(sleepScore!)
    expect(sleepScore).toBeLessThan(goodSleepScore!)
  })
})
