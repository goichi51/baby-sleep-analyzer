import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { states } from '../db/schema.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'
import { State } from '../domain/dto/State.ts'
import { gte, and, lt, asc, eq } from 'drizzle-orm'

export class StateRepository {
  constructor(private db: MySql2Database) {}

  public async insert(
    entities: State[],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db).insert(states).values(entities)
  }

  public async delete(
    since: Date,
    until: Date,
    type: State['type'],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(states)
      .where(and(gte(states.datetime, since), lt(states.datetime, until), eq(states.type, type)))
  }

  public async findByDateRange(
    since: Date,
    until: Date,
    type: 'childcare' | 'climate',
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ) {
    return (
      await (tx ?? this.db)
        .select()
        .from(states)
        .where(and(gte(states.datetime, since), lt(states.datetime, until), eq(states.type, type)))
        .orderBy(asc(states.datetime))
    ).map((r) => ({
      type: r.type,
      date: new Date(r.datetime), // TODO
    }))
  }
}
