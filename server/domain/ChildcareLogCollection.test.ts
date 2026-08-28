import { ChildcareLogCollection } from './ChildcareLogCollection.ts'
import { Diary, Event } from './dto/ChildcareLog.ts'
import { describe, test, expect } from 'vitest'

describe('create', () => {
  test('複数日形式テキストからイベントと集計行後の日記を正確に解析できること', () => {
    const text = `【ぴよログ】2026年8月
----------
2026/8/1(土)
テスト太郎 (6か月1日)

04:35  起きる (詳細メモ)
05:10  ミルク 100ml

母乳合計 左 0分 / 右 0分
ミルク合計 1回 100ml
睡眠合計 4時間36分

テスト日記1行目
テスト日記2行目
----------`

    const collection = ChildcareLogCollection.create(text)

    // イベントの検証
    expect(collection.events.length).toBe(2)
    expect(collection.events[0]).toEqual(
      new Event('起きる', new Date('2026/8/1 04:35'), '(詳細メモ)'),
    )
    expect(collection.events[1]).toEqual(new Event('ミルク', new Date('2026/8/1 05:10'), '100ml'))

    // 日記の検証（集計行より下の文章が結合されているか）
    expect(collection.diary.length).toBe(1)
    expect(collection.diary[0]).toEqual(
      new Diary('テスト日記1行目\nテスト日記2行目', new Date('2026/8/1')),
    )
  })

  test('単日形式のヘッダー【ぴよログ】YYYY/M/D(週) も正しく解析できること', () => {
    const singleDayText = `【ぴよログ】2026/7/31(金)
テスト太郎 (6か月1日)

05:10  うんち

うんち合計 1回

単日ヘッダー用のテスト日記`

    const collection = ChildcareLogCollection.create(singleDayText)

    expect(collection.events.length).toBe(1)
    expect(collection.events[0].name).toEqual('うんち')
    expect(collection.events[0].datetime).toEqual(new Date('2026/7/31 05:10'))

    expect(collection.diary.length).toBe(1)
    expect(collection.diary[0]).toEqual(
      new Diary('単日ヘッダー用のテスト日記', new Date('2026/7/31')),
    )
  })

  test('集計行（~合計）がイベントとして抽出されないこと', () => {
    const text = `2026/8/1(土)
07:40  うんち 
うんち合計 1回`

    const collection = ChildcareLogCollection.create(text)

    expect(collection.events.length).toBe(1)
    expect(collection.events[0].name).toBe('うんち')
  })
})

describe('getPeriod', () => {
  test('イベント全体の最小日の0時(since)と最大日の翌日0時(until)を返せること', () => {
    const events = [
      new Event('テスト1', new Date('2026-08-01T04:35:00'), ''),
      new Event('テスト2', new Date('2026-08-03T22:00:00'), ''),
    ]
    const collection = new ChildcareLogCollection(events)

    const period = collection.getPeriod()

    // 2026/08/01 00:00:00
    expect(period.since).toEqual(new Date('2026-08-01T00:00:00'))
    // 2026/08/03 の翌日 = 2026/08/04 00:00:00
    expect(period.until).toEqual(new Date('2026-08-04T00:00:00'))
  })

  test('イベントが存在しない場合はエラーを投げること', () => {
    const collection = new ChildcareLogCollection([])
    expect(() => collection.getPeriod()).toThrow('no events')
  })
})
