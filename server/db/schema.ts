import { int, mysqlTable, varchar, primaryKey, double, date, datetime } from 'drizzle-orm/mysql-core'

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
    datetime: datetime().notNull(),
  },
  (table) => ([
    primaryKey({ columns: [table.type, table.datetime] }),
  ]),
)

export const climateData = mysqlTable(
  'climate_data',
  {
    datetime: datetime().primaryKey(),
    temperature: double().notNull(),
    humidity: double().notNull()
  }
)
