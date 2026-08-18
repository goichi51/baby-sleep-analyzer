import { MySql2Database, MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { eq, and, gte, lt } from 'drizzle-orm'
import { diaries } from '../db/schema.ts'
import { MySqlAsyncTransaction } from 'drizzle-orm/mysql-core'
import { Diary } from '../domain/dto/ChildcareLog.ts'

export class DiaryRepository {
  constructor(private db: MySql2Database) { }

  public async insert(
    entities: Diary[],
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db).insert(diaries).values(entities)
  }

  public async delete(
    since: Date,
    until: Date,
    tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(diaries)
      .where(and(gte(diaries.date, since), lt(diaries.date, until)))
  }

  public async findByDate(date: Date, tx?: MySqlAsyncTransaction<MySql2QueryResultHKT>) {
    return (await (tx ?? this.db).select().from(diaries).where(eq(diaries.date, date))).map(
      (r) =>
        ({
          text: r.text,
          date: new Date(r.date), // TODO
        }) as Diary,
    )
  }
}
