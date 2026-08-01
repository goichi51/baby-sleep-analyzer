import { addHours, addDays, startOfDay, subDays } from 'date-fns'

export class Time {
  private static DAY_TIME_START = 6
  private static NIGHT_TIME_START = 22

  /**
   * 日時(date)を受け取り、DAY_TIME_START を基準とした日付を返す
   * 例) DAY_TIME_START = 6 の場合 2026-01-01 06:00 ~ 2026-01-02 05:59 は 2026-01-01 扱い
   * @param date 判定する日時
   * @returns DAY_TIME_START を基準とした日付
   **/
  public static shiftedDate(date: Date) {
    const range = this.nightTime(subDays(date, 1))
    if (date < range.end) {
      return subDays(startOfDay(date), 1)
    }
    return startOfDay(date)
  }

  /**
   * 日時を受け取り、日の開始と終了を返す
   * @param date
   * @returns 夜時間の開始時刻と終了時刻
   */
  // TODO 名前
  public static shiftedTime(date: Date) {
    return {
      start: addHours(startOfDay(date), this.DAY_TIME_START),
      end: addHours(addDays(startOfDay(date), 1), this.DAY_TIME_START),
    }
  }

  /**
   * 日時を受け取り、夜時間の開始と終了を返す
   * @param date
   * @returns 夜時間の開始時刻と終了時刻
   */
  public static nightTime(date: Date) {
    return {
      start: addHours(startOfDay(date), this.NIGHT_TIME_START),
      end: addHours(addDays(startOfDay(date), 1), this.DAY_TIME_START),
    }
  }
}
