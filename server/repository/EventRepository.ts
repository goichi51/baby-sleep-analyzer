import { MySql2Database } from 'drizzle-orm/mysql2'
import { lt, gte, and, asc } from 'drizzle-orm'
import { events } from '../db/schema.ts'
import { Event } from '../domain/dto/event.ts'
import { tzDate } from '../tzDate.ts'

export interface EventRepository {
  insert: (entities: Event[]) => void
  findByDate: (since: Date, until: Date) => Promise<Event[]>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private db: MySql2Database) {}

  public insert(entities: Event[]) {
    return this.db.insert(events).values(entities)
  }

  public async findByDate(since: Date, until: Date) {
    return (
      await this.db
        .select()
        .from(events)
        .where(and(gte(events.datetime, since), lt(events.datetime, until)))
        .orderBy(asc(events.datetime))
    ).map((r) => ({
      ...r,
      datetime: tzDate(r.datetime), // TODO
    }))
  }
}
