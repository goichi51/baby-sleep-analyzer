import { ClimateLogCollection } from './ClimateLogCollection.ts'
import { ClimateData } from './dto/ClimateLog.ts'
import { describe, test, expect } from 'vitest'

describe('create', () => {
  test('正しいCSVデータから1時間あたり最初に出現した1件のみを抽出して生成できること', () => {
    const csvText = `Date,Temperature_Celsius(℃),Relative_Humidtesty(%),DPT(℃),VPD(kPa),Abs Humidtesty(g/m³)
2026-07-21 17:02,29.2,52,18.3,1.94,15.10
2026-07-21 17:03,29.4,49,17.5,2.08,14.34
2026-07-21 18:00,28.0,60,17.0,1.80,14.00`

    const collection = ClimateLogCollection.create(csvText)

    // 17時台と18時台で合計2件抽出される
    expect(collection.data.length).toBe(2)

    // 17:02のデータが 17:00 (startOfHour) として採用され、17:03は重複としてスキップされる
    expect(collection.data[0].datetime).toEqual(new Date('2026-07-21T17:00:00'))
    expect(collection.data[0].temperature).toBe(29.2)
    expect(collection.data[0].humidity).toBe(52)

    // 18:00のデータ
    expect(collection.data[1].datetime).toEqual(new Date('2026-07-21T18:00:00'))
    expect(collection.data[1].temperature).toBe(28.0)
  })

  test('ヘッダーのみまたは空のCSVの場合は空配列を持つインスタンスを返すこと', () => {
    const emptyCsv = `Date,Temperature_Celsius(℃),Relative_Humidtesty(%),DPT(℃),VPD(kPa),Abs Humidtesty(g/m³)`
    const collection = ClimateLogCollection.create(emptyCsv)

    expect(collection.data).toEqual([])
  })

  test('空行が含まれていても無視して処理できること', () => {
    const csvWtesthEmptyLines = `Date,Temperature_Celsius(℃),Relative_Humidtesty(%)
2026-07-21 17:02,29.2,52

2026-07-21 18:02,28.5,55
`

    const collection = ClimateLogCollection.create(csvWtesthEmptyLines)
    expect(collection.data.length).toBe(2)
  })
})

describe('getPeriod', () => {
  test('データ群の最小日時(since)と最大日時+1時間(until)を正しく返せること', () => {
    const data = [
      new ClimateData(new Date('2026-07-21T17:00:00'), 29.2, 52),
      new ClimateData(new Date('2026-07-21T19:00:00'), 27.5, 65),
      new ClimateData(new Date('2026-07-21T18:00:00'), 28.0, 60),
    ]
    const collection = new ClimateLogCollection(data)

    const period = collection.getPeriod()

    // 最小日時
    expect(period.since).toEqual(new Date('2026-07-21T17:00:00'))
    // 最大日時 (19:00) + 1時間 = 20:00
    expect(period.until).toEqual(new Date('2026-07-21T20:00:00'))
  })

  test('データが存在しない場合はエラーをなげること', () => {
    const collection = new ClimateLogCollection([])
    expect(() => collection.getPeriod()).toThrow('no data')
  })
})
