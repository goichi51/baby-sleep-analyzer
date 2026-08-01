import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { DayLog } from './domain/DayLog.ts'
import { EventRepository, EventRepositoryImpl } from './repository/EventRepository.ts'
import { db } from './db/client.ts'
import { addDays, startOfDay, format } from 'date-fns'
import { Time } from './Time.ts'
import { Summary } from './domain/Summary.ts'
import { tzDate } from './tzDate.ts'

const app = new Hono()
const repo: EventRepository = new EventRepositoryImpl(db)

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Backend!' })
})

/**
 * ぴよログのデータをインポートする
 */
app.post('api/events', async (c) => {
  const req = await c.req.json<{ text: string }>()
  console.log(req.text)
  const parsed = DayLog.create(req.text)
  const { since, until } = parsed.getRange()
  console.log({ since, until })
  await db.transaction(async (tx) => {
    await repo.delete(startOfDay(since), addDays(startOfDay(until), 1), tx)
    await repo.insert(parsed.events, tx)
  })
  return c.json({ result: 'ok' })
})

/**
 * date で指定された日の出来事を取得する
 */
// app.get('api/events', async (c) => {
//   const { date } = c.req.query() // YYYY-MM-DD
//   const { start, end } = Time.shiftedTime(new Date(date))
//   console.log(start, end)
//   const events = await repo.findByDate(start, end)
//   return c.json(events)
// })

app.get('api/summaries', async (c) => {
  const { date } = c.req.query() // YYYY-MM-DD
  const timeRange = Time.shiftedTime(new Date(date))
  const events = await repo.findByDate(timeRange.start, timeRange.end)
  if (events.length === 0) {
    return c.json({ message: 'Not Found' }, 404)
  }
  const nightTimeRange = Time.nightTime(new Date(date))
  const summary = new Summary(new DayLog(events), nightTimeRange.start, nightTimeRange.end)
  return c.json(summary)
})

app.get('api/summaries/score', async (c) => {
  const { since, until } = c.req.query() // YYYY-MM-DD, until を含む
  // TODO shiftedtimeを使う
  const events = await repo.findByDate(tzDate(since), addDays(tzDate(until), 1))
  // 朝6時を基準とした日付でグルーピング
  const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
    format(Time.shiftedDate(datetime), 'yyyy-MM-dd'),
  )
  // untilの次の日の分のデータは不要のため削除
  dateEventsMap.delete(format(addDays(tzDate(until), 1), 'yyyy-MM-dd'))

  const summaries = dateEventsMap.entries().map(([date, events]) => {
    const { start, end } = Time.nightTime(startOfDay(tzDate(date)))
    return new Summary(new DayLog(events), start, end)
  })
  return c.json(
    Array.from(
      summaries.map((summary) => ({
        date: startOfDay(summary.nightTimeStart),
        score: summary.score,
      })),
    ),
  )
})

/**
 * 朝6時を基準として日毎に睡眠のスコアを集計し、上位/下位 num 個のデータを返す、
 */
app.get('api/summaries/ranking', async (c) => {
  const { since, until, num = 3 } = c.req.query() // YYYY-MM-DD, until を含む
  const events = await repo.findByDate(tzDate(since), addDays(tzDate(until), 1))
  // 朝6時を基準とした日付でグルーピング
  const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
    format(Time.shiftedDate(datetime), 'yyyy-MM-dd'),
  )
  // untilの次の日の分のデータは不要のため削除
  dateEventsMap.delete(format(addDays(tzDate(until), 1), 'yyyy-MM-dd'))

  const summaries = dateEventsMap.entries().map(([date, events]) => {
    const { start, end } = Time.nightTime(startOfDay(tzDate(date)))
    return new Summary(new DayLog(events), start, end)
  })
  const sorted = Array.from(summaries).sort((a, b) => b.computeScore() - a.computeScore())
  return c.json({
    best: sorted.slice(0, Number(num)),
    worst: sorted.toReversed().slice(0, Number(num)),
  })
})

app.use('/*', serveStatic({ root: './dist' }))

serve({ fetch: app.fetch, port: 3000 })
