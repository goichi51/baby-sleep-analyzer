import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { states } from '../db/schema.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'
import { State } from '../domain/dto/State.ts'
import { gte, and, lt, asc } from 'drizzle-orm'

export class StateRepository {
  constructor(private db: MySql2Database) {}

  public async insert(
    entities: State[],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db).insert(states).values(entities)
  }

  public async findByDateRange(
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ) {
    return (
      await (tx ?? this.db)
        .select()
        .from(states)
        .where(and(gte(states.date, since), lt(states.date, until)))
        .orderBy(asc(states.date))
    ).map((r) => ({
      type: r.type,
      date: new Date(r.date), // TODO
    }))
  }
}
