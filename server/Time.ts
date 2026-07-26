import { addHours, getHours, addDays, startOfDay, subDays } from 'date-fns'

export class Time {
  private static NIGHT_TIME_START = 22
  private static NIGHT_TIME_END = 6

  /**
   * 日時(date)を受け取り、NIGHT_TIME_END を基準とした日付を返す
   * 例) NIGHT_TIME_END = 6 の場合 2026-01-01 06:00 ~ 2026-01-02 05:59 は 2026-01-01 扱い
   * @param date 判定する日時
   * @returns NIGHT_TIME_END を基準とした日付
   **/
  public static nightDate(date: Date) {
    const range = this.nightTime(subDays(date, 1))
    if (date < range.end) {
      return subDays(startOfDay(date), 1)
    }
    return startOfDay(date)
  }

  /**
   * 日時を受け取り、夜時間の開始と終了を返す
   * @param date
   * @returns 夜時間の開始時刻と終了時刻
   */
  public static nightTime(date: Date) {
    return {
      start: addHours(startOfDay(date), this.NIGHT_TIME_START),
      end: addHours(addDays(startOfDay(date), 1), this.NIGHT_TIME_END),
    }
  }

  /**
   * 夜時間かどうか判定する
   * @param date 判定する日時
   * @returns 夜時間なら true
   */
  public static isNightTime(date: Date) {
    const range = Time.nightTime(date)
    return date < range.end || date >= range.start
  }
}
