import { eachDayOfInterval, eachHourOfInterval, subDays, subHours } from 'date-fns'

export class State {
  constructor(
    public type: 'childcare' | 'climate',
    public datetime: Date,
  ) {}
}