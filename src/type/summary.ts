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
  } | null
  score: number | null
  lastFeedingTime: string | null
  lastSleepingTime: string | null
  daySleepDuration: number | null
  avgTemperature: number | null
  haveWalk: boolean | null
}
