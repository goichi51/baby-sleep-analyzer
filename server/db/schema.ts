import { datetime } from 'drizzle-orm/mssql-core'
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const events = mysqlTable('events', {
  id: int().primaryKey().autoincrement(),
  datetime: datetime().notNull(),
  name: varchar({ length: 64 }).notNull(),
})
