import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { lt, gte, and, asc } from 'drizzle-orm'
import { events } from '../db/schema.ts'
import { Event } from '../domain/dto/Event.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'

export class EventRepository {
  constructor(private db: MySql2Database) {}

  public async insert(
    entities: Event[],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db).insert(events).values(entities)
  }

  public async delete(
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(events)
      .where(and(gte(events.datetime, since), lt(events.datetime, until)))
  }

  public async findByDateRange(
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
      name: r.name,
      memo: r.memo ?? undefined,
      datetime: new Date(r.datetime), // TODO
    }))
  }
}
