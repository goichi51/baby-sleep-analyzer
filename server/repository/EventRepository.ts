import { MySql2Database } from 'drizzle-orm/mysql2'
import { lt, gte, and, asc } from 'drizzle-orm'
import { events } from '../db/schema.ts'
import { Event } from '../domain/dto/event.ts'

type EventEntity = Event & { id: number }

export interface EventRepository {
  insert: (entities: Event[]) => void
  findByDate: (since: Date, until: Date) => Promise<EventEntity[]>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private db: MySql2Database) {}

  public insert(entities: Event[]) {
    return this.db.insert(events).values(entities)
  }

  public findByDate(since: Date, until: Date) {
    return this.db
      .select()
      .from(events)
      .where(and(gte(events.datetime, since), lt(events.datetime, until)))
      .orderBy(asc(events.datetime))
  }
}
