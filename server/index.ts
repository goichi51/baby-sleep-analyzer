import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { DayLog } from './domain/DayLog.ts'
import { EventRepository, EventRepositoryImpl } from './repository/EventRepository.ts'
import { db } from './db/client.ts'
import { addDays, startOfDay, format } from 'date-fns'
import { Time } from './Time.ts'
import { SleepSummary } from './domain/SleepSummary.ts'

const app = new Hono()
const repo: EventRepository = new EventRepositoryImpl(db)

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Backend!' })
})

/**
 * ぴよろぐのデータをインポートする
 */
app.post('api/events', async (c) => {
  const req = await c.req.json<{ text: string }>()
  const parsed = DayLog.create(req.text)
  await repo.insert(parsed.events)
  return c.json({ result: 'ok' })
})

/**
 * date で指定された日の出来事を取得する
 */
app.get('api/events', async (c) => {
  const { date } = c.req.query() // YYYY-MM-DD
  const since = startOfDay(new Date(date))
  const until = addDays(since, 1)
  const events = await repo.findByDate(since, until)
  return c.json({ events })
})

app.get('api/events/ranking', async (c) => {
  const { since, until, num = 5 } = c.req.query() // YYYY-MM-DD, until を含む
  const events = await repo.findByDate(
    startOfDay(new Date(since)),
    addDays(startOfDay(new Date(until)), 1),
  )

  const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
    format(Time.nightDate(datetime), 'yyyy-MM-dd'),
  )
  const summaries = dateEventsMap.entries().map(([date, events]) => {
    const { start, end } = Time.nightTime(startOfDay(new Date(date)))
    return new SleepSummary(new DayLog(events), start, end)
  })
  const sorted = Array.from(summaries).sort((a, b) => b.score() - a.score())
  return c.json({
    best: sorted.slice(0, Number(num)),
    worst: sorted.toReversed().slice(0, Number(num)),
  })
})

app.use('/*', serveStatic({ root: './dist' }))

serve({ fetch: app.fetch, port: 3000 })
