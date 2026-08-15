export interface Event {
  datetime: string
  name: string
  memo: string
}

export interface Diary {
  date: string
  text: string
}

export interface ChildcareLog {
  events: Event[]
  diary: Diary | null
}

export interface ClimateLog {
  datetime: string
  temperature: number
  humidity: number
}