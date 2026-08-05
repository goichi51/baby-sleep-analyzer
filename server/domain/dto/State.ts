import { eachDayOfInterval, subDays } from 'date-fns'

export class State {
  constructor(
    public type: 'childcare' | 'weather',
    public date: Date,
  ) {}
}

export class StateCollection {
  public states: State[]

  constructor(since: Date, until: Date, type: State['type']) {
    const dates = eachDayOfInterval({
      start: since,
      end: subDays(until, 1),
    })
    this.states = dates.map((date) => new State(type, date))
  }
}
