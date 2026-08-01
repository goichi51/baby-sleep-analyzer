import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { lt, gte, and, asc } from 'drizzle-orm'
import { events } from '../db/schema.ts'
import { Event } from '../domain/dto/event.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'

export interface EventRepository {
  insert: (entities: Event[], tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>) => void
  delete: (since: Date, until: Date, tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>) => void
  findByDate: (
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ) => Promise<Event[]>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private db: MySql2Database) {}

  public insert(entities: Event[], tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>) {
    return (tx ?? this.db).insert(events).values(entities)
  }

  public delete(since: Date, until: Date, tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>) {
    return (tx ?? this.db)
      .delete(events)
      .where(and(gte(events.datetime, since), lt(events.datetime, until)))
  }

  public async findByDate(
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ) {
    return (
      await (tx ?? this.db)
        .select()
        .from(events)
        .where(and(gte(events.datetime, since), lt(events.datetime, until)))
        .orderBy(asc(events.datetime))
    ).map((r) => ({
      ...r,
      datetime: new Date(r.datetime), // TODO
    }))
  }
}
