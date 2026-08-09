import { datetime, date } from 'drizzle-orm/mssql-core'
import { int, mysqlTable, varchar, primaryKey, double } from 'drizzle-orm/mysql-core'

export const events = mysqlTable('events', {
  id: int().primaryKey().autoincrement(),
  datetime: datetime().notNull(),
  name: varchar({ length: 64 }).notNull(),
  memo: varchar({ length: 256 }).default(''),
})

export const diaries = mysqlTable('diaries', {
  date: date().primaryKey(),
  text: varchar({ length: 256 }).notNull(),
})

export const states = mysqlTable(
  'states',
  {
    type: varchar({ length: 10, enum: ['childcare', 'climate'] }).notNull(),
    date: date().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.type, table.date] }),
  }),
)

export const room_climate_logs = mysqlTable(
  'room_climate_logs',
  {
    datetime: datetime().primaryKey(),
    temperature: double().notNull(),
    humidity: double().notNull()
  }
)
