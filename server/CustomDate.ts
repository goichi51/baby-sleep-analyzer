import { addHours, addDays, startOfDay, subDays } from 'date-fns'

/**
 * DAY_TIME_START を基準にした1日を表す
 */
export class CustomDate {
  private static DAY_TIME_START = 6
  private static NIGHT_TIME_START = 22

  /**
   * 日時(date)を受け取り、DAY_TIME_START を基準とした日付を返す
   * 例) DAY_TIME_START = 6 の場合 2026-01-01 06:00 ~ 2026-01-02 05:59 は 2026-01-01 扱い
   * @param date 判定する日時
   * @returns DAY_TIME_START を基準とした日付
   **/
  public static getDate(date: Date | string) {
    const d = this.toDate(date)
    const period = this.getDayPeriod(d)
    return d < period.start ? subDays(d, 1) : d
  }

  /**
   * 日時を受け取り、日の開始と終了を返す
   * @param date
   * @returns 夜時間の開始時刻と終了時刻(end は期間に含まない）
   */
  // TODO 名前
  public static getDayPeriod(date: Date | string) {
    const d = this.toStartOfDay(date)
    return {
      start: addHours(d, this.DAY_TIME_START),
      end: addHours(addDays(d, 1), this.DAY_TIME_START),
    }
  }

  /**
   * 日時を受け取り、夜時間の開始と終了を返す
   * @param date
   * @returns 夜時間の開始時刻と終了時刻
   */
  public static getNightTime(date: Date | string) {
    const d = this.toStartOfDay(date)
    return {
      start: addHours(d, this.NIGHT_TIME_START),
      end: addHours(addDays(d, 1), this.DAY_TIME_START),
    }
  }

  private static toDate(date: Date | string) {
    return typeof date === 'string' ? new Date(date) : date
  }

  private static toStartOfDay(date: Date | string) {
    return startOfDay(typeof date === 'string' ? new Date(date) : date)
  }
}
