import { TZDate } from '@date-fns/tz'

export const tzDate = (dt: string) => TZDate.tz('Asia/Tokyo', dt)
