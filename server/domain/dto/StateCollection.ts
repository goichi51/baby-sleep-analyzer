import { eachDayOfInterval, eachHourOfInterval, subDays, subHours } from 'date-fns'
import { State } from './State.ts'

export class StateCollection {
  public states: State[]

  constructor(since: Date, until: Date, type: State['type']) {
    if (type === 'childcare') {
const dates = eachDayOfInterval({
      start: since,
      end: subDays(until, 1),
    })
    this.states = dates.map((date) => new State(type, date))
    return
    }
    
   const datehours = eachHourOfInterval({
      start: since, end: subHours(until, 1)
   })
    this.states = datehours.map((date) => new State(type, date))
  }
}
