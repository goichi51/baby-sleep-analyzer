import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { lt, gte, and, asc } from 'drizzle-orm'
import { climateData } from '../db/schema.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'
import { ClimateData } from '../domain/dto/ClimateLog.ts'

export class ClimateDataRepository {
  constructor(private db: MySql2Database) { }

  public async insert(
    entities: ClimateData[],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db).insert(climateData).values(entities)
  }

  public async delete(
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(climateData)
      .where(and(gte(climateData.datetime, since), lt(climateData.datetime, until)))
  }

  public async findByDateRange(
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ) {
    return (
      await (tx ?? this.db)
        .select()
        .from(climateData)
        .where(and(gte(climateData.datetime, since), lt(climateData.datetime, until)))
        .orderBy(asc(climateData.datetime))
    ).map((r) => ({
      temperature: r.temperature,
      humidity: r.humidity,
      datetime: new Date(r.datetime), // TODO
    }))
  }
}
