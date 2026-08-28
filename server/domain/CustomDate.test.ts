import { CustomDate } from './CustomDate.ts'
import { describe, test, expect } from 'vitest'

describe('getDate', () => {
  test('6:00以降は当日として扱われること', () => {
    const result = CustomDate.getDate('2026-01-01T06:00:00')
    expect(result).toEqual(new Date('2026-01-01T00:00:00'))
  })

  test('5:59以前は前日として扱われること', () => {
    const result = CustomDate.getDate('2026-01-02T05:59:59')
    expect(result).toEqual(new Date('2026-01-01T00:00:00'))
  })

  test('23:59も当日として扱われること', () => {
    const result = CustomDate.getDate('2026-01-01T23:59:59')
    expect(result).toEqual(new Date('2026-01-01T00:00:00'))
  })

  test('Dateオブジェクトを渡しても正しく判定できること', () => {
    const date = new Date(2026, 0, 1, 5, 0) // 2026-01-01 05:00
    const result = CustomDate.getDate(date)
    expect(result).toEqual(new Date(2025, 11, 31, 0, 0)) // 2025-12-31
  })
})

describe('getDayPeriod', () => {
  test('指定した日の 06:00 から翌日 06:00 までの期間を返すこと', () => {
    const result = CustomDate.getDayPeriod('2026-01-01T15:00:00')
    expect(result.start).toEqual(new Date('2026-01-01T06:00:00'))
    expect(result.end).toEqual(new Date('2026-01-02T06:00:00'))
  })
})

describe('getNightTime', () => {
  test('指定した日の 22:00 から翌日 06:00 までの期間を返すこと', () => {
    const result = CustomDate.getNightTime('2026-01-01T10:00:00')
    expect(result.start).toEqual(new Date('2026-01-01T22:00:00'))
    expect(result.end).toEqual(new Date('2026-01-02T06:00:00'))
  })
})
