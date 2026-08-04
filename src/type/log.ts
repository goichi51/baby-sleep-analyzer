export interface Event {
  datetime: string
  name: string
  memo: string
}

export interface Diary {
  date: string
  text: string
}

export interface Log {
  events: Event[]
  diary: Diary | null
}
