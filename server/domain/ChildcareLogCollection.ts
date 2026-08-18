import { addDays, startOfDay } from 'date-fns'
import { Diary, Event } from './dto/ChildcareLog.ts'

export interface Period {
  since: Date
  until: Date
}

/**
 * ぴよろぐからエクスポートされたデータを読み取り変換する
 */
export class ChildcareLogCollection {
  constructor(
    public events: Event[] = [],
    public diary: Diary[] = [],
  ) { }

  public static create(text: string) {
    const events: Event[] = []
    const diaries: Diary[] = []

    // 日付ヘッダーの正規表現
    // 1. 1行目単日ヘッダー用: 例 "【ぴよログ】2026/7/31(金)"
    const singleDayHeaderRegex = /^【ぴよログ】\s*(\d{4}\/\d{1,2}\/\d{1,2})\(/
    // 2. 複数日区切り行用: 例 "2026/7/1(水)"
    const dateHeaderRegex = /^(\d{4}\/\d{1,2}\/\d{1,2})\(/

    // ログ行の正規表現: 例 "05:10   起きる (7時間5分) "
    const logLineRegex = /^(\d{2}:\d{2})\s+([^\s]+)(.*)$/

    // 「うんち合計」等の集計行の判定（イベント行と区別するため）
    const summaryRegex = /^(母乳|ミルク|搾母乳|睡眠|おしっこ|うんち)合計/

    const lines = text.split(/\r?\n/)

    let currentDateStr: string | null = null
    let isAfterSummary = false
    let currentDiaryLines: string[] = []

    // その日の日記を確定してイベントに追加するヘルパー関数
    const flushDiary = () => {
      if (currentDateStr && currentDiaryLines.length > 0) {
        const diary = currentDiaryLines.join('\n').trim()
        if (diary) {
          const date = new Date(currentDateStr)
          diaries.push(new Diary(diary, date))
        }
      }
      currentDiaryLines = []
    }

    for (const rawLine of lines) {
      const line = rawLine.trim()

      // 区切り線があった場合は「その日の日記」を確定してフラグをリセット
      if (line.startsWith('----------')) {
        flushDiary()
        isAfterSummary = false
        continue
      }

      if (!line) continue

      // 1-A. 単日形式ヘッダーの判定（【ぴよログ】2026/7/31(金) などのケース）
      const singleDayMatch = line.match(singleDayHeaderRegex)
      if (singleDayMatch) {
        flushDiary()
        currentDateStr = singleDayMatch[1] // "2026/7/31"
        isAfterSummary = false
        continue
      }

      // 1-B. 複数日形式の日付行判定（2026/7/1(水) などのケース）
      const dateMatch = line.match(dateHeaderRegex)
      if (dateMatch) {
        flushDiary()
        currentDateStr = dateMatch[1] // "2026/7/1"
        isAfterSummary = false
        continue
      }

      // 日付がセットされていない状態（月単位の「【ぴよログ】2026年7月」直後など）はスキップ
      if (!currentDateStr) continue

      // 2. 集計行（「うんち合計」など）の判定
      if (summaryRegex.test(line)) {
        isAfterSummary = true
        continue
      }

      // 3. 集計ブロックより下にある文章 ＝ 「その日の日記」として取得
      if (isAfterSummary) {
        currentDiaryLines.push(line)
        continue
      }

      // 4. 時刻付きイベント行の判定
      const logMatch = line.match(logLineRegex)
      if (logMatch) {
        const timeStr = logMatch[1] // "05:10"
        const eventName = logMatch[2] // "起きる", "おしっこ" など
        const remainingMemo = logMatch[3] ? logMatch[3].trim() : ''

        const datetime = new Date(`${currentDateStr} ${timeStr}`)
        events.push(new Event(eventName, datetime, remainingMemo))
      }
    }

    // 末尾のメモを確定
    flushDiary()

    return new ChildcareLogCollection(events, diaries)
  }

  /**
   * データの存在する期間（日）を返す(until は期間に含まない)
   * @returns データが存在する期間
   */
  public getPeriod(): Period {
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
    return { since: startOfDay(since), until: addDays(startOfDay(until), 1) }
  }
}
