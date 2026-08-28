import { format } from 'date-fns'

export const toDisplayDate = (date: string | null | undefined) =>
  date ? format(date, 'yyyy/MM/dd') : '----/--/--'

export const toDisplayDatetime = (date: string | null | undefined) =>
  date ? format(date, 'yyyy/MM/dd HH:mm') : '----/--/--'

export const toDisplayTime = (date: string | null | undefined) =>
  date ? format(date, 'HH:mm') : '--:--'

export const toIsoDate = (date: Date | null | undefined) =>
  date ? format(date, 'yyyy-MM-dd') : '-'
