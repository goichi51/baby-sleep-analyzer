export interface Session {
  start: string
  end: string
  duration: number
}

export interface Summary {
  nightTimeStart: string
  nightTimeEnd: string
  nightSummary: {
    sleepSession: Session[]
    awakeSession: Session[]
    awakenings: number
    total: number
  }
  score: number
  lastFeedingTime: string
  lastSleepingTime: string
  daySleepDuration: number
}
