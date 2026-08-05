import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { states } from '../db/schema.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'
import { State } from '../domain/dto/State.ts'

export class StateRepository {
  constructor(private db: MySql2Database) {}

  public async insert(
    entities: State[],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db).insert(states).values(entities)
  }
}
