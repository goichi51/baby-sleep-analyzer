import { describe, test, expect } from 'vitest'
import { Event } from './dto/Event.ts'
import { PiyologData } from './PiyologData.ts'
import { Summary } from './Summary.ts'

const startAt = new Date('2026-07-25T22:00:00Z')
const endAt = new Date('2026-07-26T06:00:00Z')

describe('summarize', () => {
  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒あり)', () => {
    const events: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T04:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const input = new PiyologData(events, [])
    const summary = new Summary(input, startAt, endAt).computeNightSleep()
    expect(summary.sleepSession).toEqual([
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
    expect(summary.awakeSession).toEqual([
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
    expect(summary.awakenings).toEqual(2)
  })

  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒なし)', () => {
    const input = new PiyologData([], [])
    const summary = new Summary(input, startAt, endAt).computeNightSleep()
    expect(summary.sleepSession).toEqual([
      {
        start: new Date('2026-07-25T22:00:00Z'),
        end: new Date('2026-07-26T06:00:00Z'),
        duration: 8,
      },
    ])
    expect(summary.awakenings).toEqual(0)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒あり)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const input = new PiyologData(events, [])
    const summary = new Summary(input, startAt, endAt).computeNightSleep()
    expect(summary.sleepSession).toEqual([
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
    expect(summary.awakeSession).toEqual([
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
    expect(summary.awakenings).toEqual(3)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒なし)', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const input = new PiyologData(events, [])
    const summary = new Summary(input, startAt, endAt).computeNightSleep()
    expect(summary.sleepSession).toEqual([
      {
        start: new Date('2026-07-25T23:00:00Z'),
        end: new Date('2026-07-26T05:00:00Z'),
        duration: 6,
      },
    ])
    expect(summary.awakeSession).toEqual([
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
    expect(summary.awakenings).toEqual(2)
  })
})

describe('score', () => {
  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒あり)', () => {
    const events: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T04:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const input = new PiyologData(events, [])
    expect(new Summary(input, startAt, endAt).computeScore()).toEqual(122.5)
  })

  test('startAt 以前に入眠、endAt 以降に覚醒（途中覚醒なし)', () => {
    const input = new PiyologData([], [])
    expect(new Summary(input, startAt, endAt).computeScore()).toEqual(640)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒あり）', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T01:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T01:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const input = new PiyologData(events, [])
    expect(new Summary(input, startAt, endAt).computeScore()).toEqual(97.5)
  })

  test('startAt 以降に入眠、endAt 以前に覚醒（途中覚醒なし）', () => {
    const events: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
    ]
    const input = new PiyologData(events, [])
    expect(new Summary(input, startAt, endAt).computeScore()).toEqual(310)
  })

  test('総睡眠時間が同じでも覚醒回数が少ないほうがスコアが高い', () => {
    // 2回覚醒（低スコア）
    const badSleepEvents: Event[] = [
      { name: '寝る', datetime: new Date('2026-07-25T22:30:00Z') },
      { name: '起きる', datetime: new Date('2026-07-26T05:30:00Z') },
    ]
    const badSleepLog = new PiyologData(badSleepEvents, [])
    const badSleepScore = new Summary(badSleepLog, startAt, endAt).computeScore()

    // 1回覚醒（高スコア）
    const goodSleepEvents: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T23:00:00Z') }]
    const goodSleepLog = new PiyologData(goodSleepEvents, [])
    const goodSleepScore = new Summary(goodSleepLog, startAt, endAt).computeScore()

    expect(badSleepScore).toBeLessThan(goodSleepScore)
  })

  test('総睡眠時間が同じでも長い睡眠睡眠ブロックがあるほうがスコアが高い', () => {
    // 総睡眠時間のちょうど半分で覚醒（低スコア）
    const badSleepEvents: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:05:00Z') },
    ]
    const badSleepLog = new PiyologData(badSleepEvents, [])
    const badSleepScore = new Summary(badSleepLog, startAt, endAt).computeScore()

    // 前半の睡眠が長くとれた（中程度のスコア）
    const sleepEvents: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T05:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T05:05:00Z') },
    ]
    const sleepLog = new PiyologData(sleepEvents, [])
    const sleepScore = new Summary(sleepLog, startAt, endAt).computeScore()

    // 中途覚醒なし（高スコア）
    const goodSleepEvents: Event[] = [{ name: '寝る', datetime: new Date('2026-07-25T22:05:00Z') }]
    const goodSleepLog = new PiyologData(goodSleepEvents, [])
    const goodSleepScore = new Summary(goodSleepLog, startAt, endAt).computeScore()

    expect(badSleepScore).toBeLessThan(sleepScore)
    expect(sleepScore).toBeLessThan(goodSleepScore)
  })

  test('覚醒回数がおなじでも覚醒時間が少ない方がスコアが高い', () => {
    // 覚醒が長い（低スコア）
    const badSleepEvents: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:10:00Z') },
    ]
    const badSleepLog = new PiyologData(badSleepEvents, [])
    const badSleepScore = new Summary(badSleepLog, startAt, endAt).computeScore()

    // 中程度の覚醒（中程度のスコア）
    const sleepEvents: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:05:00Z') },
    ]
    const sleepLog = new PiyologData(sleepEvents, [])
    const sleepScore = new Summary(sleepLog, startAt, endAt).computeScore()

    // 覚醒時間が短い（高スコア）
    const goodSleepEvents: Event[] = [
      { name: '起きる', datetime: new Date('2026-07-26T03:00:00Z') },
      { name: '寝る', datetime: new Date('2026-07-26T03:01:00Z') },
    ]
    const goodSleepLog = new PiyologData(goodSleepEvents, [])
    const goodSleepScore = new Summary(goodSleepLog, startAt, endAt).computeScore()

    expect(badSleepScore).toBeLessThan(sleepScore)
    expect(sleepScore).toBeLessThan(goodSleepScore)
  })
})
