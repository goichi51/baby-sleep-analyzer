import { tzDate } from '../tzDate.ts'
import { Event } from './dto/event.ts'

export interface Range {
  since: Date
  until: Date
}

export class DayLog {
  constructor(public events: Event[] = []) {}

  public static create(text: string) {
    const events: Event[] = []
    // 対象とするイベント名の定義
    const TARGET_EVENTS = ['寝る', '起きる', '母乳', '搾母乳', 'ミルク', '離乳食']

    // 日付ヘッダーの正規表現: 例 "2026/7/1(水)"
    const dateHeaderRegex = /^(\d{4}\/\d{1,2}\/\d{1,2})\(/

    // ログ行の正規表現: 例 "05:10   起きる (7時間5分) " や "13:30   搾母乳 130ml "
    // 行頭の「HH:mm」、イベント名、それ以降（メモや補足情報）を取得
    const logLineRegex = /^(\d{2}:\d{2})\s+([^\s]+)(.*)$/

    const lines = text.split(/\r?\n/)
    let currentDateStr: string | null = null
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) continue

      // 1. 日付行の判定
      const dateMatch = line.match(dateHeaderRegex)
      if (dateMatch) {
        currentDateStr = dateMatch[1] // "2026/7/1"
        continue
      }

      // 日付がまだセットされていない状態（ヘッダー部分等）はスキップ
      if (!currentDateStr) continue

      // 2. ログ行の判定
      const logMatch = line.match(logLineRegex)
      if (logMatch) {
        const timeStr = logMatch[1] // "05:10"
        const eventName = logMatch[2] // "起きる" や "母乳"

        // 対象イベントに含まれるか判定
        if (TARGET_EVENTS.includes(eventName)) {
          const datetime = tzDate(`${currentDateStr} ${timeStr}`)

          events.push(new Event(eventName, datetime))
        }
      }
    }
    return new DayLog(events)
  }

  public getRange(): Range {
    let since: Date | null = null
    let until: Date | null = null
    this.events.forEach((e) => {
      if (since === null || since > e.datetime) {
        since = e.datetime
      }
      if (until === null || until < e.datetime) {
        until = e.datetime
      }
    })
    if (since === null || until === null) {
      throw new Error('no events') // TODO
    }
    return { since, until }
  }
}
