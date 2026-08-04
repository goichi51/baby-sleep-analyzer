import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { PiyologDataCollection } from './domain/PiyologDataCollection.ts'
import { EventRepository } from './repository/EventRepository.ts'
import { db } from './db/client.ts'
import { addDays, startOfDay, format } from 'date-fns'
import { CustomDate } from './CustomDate.ts'
import { Summary } from './domain/Summary.ts'
import { tzDate } from './tzDate.ts'
import { DiaryRepository } from './repository/DiaryRepository.ts'
import { PiyologData } from './domain/PiyologData.ts'

const app = new Hono()
const eventRepo = new EventRepository(db)
const diaryRepo = new DiaryRepository(db)

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Backend!' })
})

/**
 * ぴよログのデータをインポートする
 */
app.post('api/events', async (c) => {
  const req = await c.req.json<{ text: string }>()
  const parsed = PiyologDataCollection.create(req.text)
  const { since, until } = parsed.getRange()
  await db.transaction(async (tx) => {
    await eventRepo.delete(since, until, tx)
    await eventRepo.insert(parsed.events, tx)
    await diaryRepo.delete(since, until, tx)
    await diaryRepo.insert(parsed.diary, tx)
  })
  return c.json({ result: 'ok' })
})

/**
 * date で指定された日の出来事を取得する
 */
app.get('api/events', async (c) => {
  const { date } = c.req.query() // YYYY-MM-DD
  const { start, end } = CustomDate.getDayRange(new Date(date))
  const events = await eventRepo.findByDateRange(start, end)
  const diary = await diaryRepo.findByDate(startOfDay(new Date(date)))
  if (events.length === 0) {
    return c.json({ message: 'Not Found' }, 404)
  }
  return c.json(new PiyologData(events, diary.length > 0 ? diary[0] : null))
})

app.get('api/summaries', async (c) => {
  const { date } = c.req.query() // YYYY-MM-DD
  if (!date) {
    return c.json({ message: 'Bad Request' }, 400)
  }
  const timeRange = CustomDate.getDayRange(new Date(date))
  const events = await eventRepo.findByDateRange(timeRange.start, timeRange.end)
  if (events.length === 0) {
    return c.json({ message: 'Not Found' }, 404)
  }
  const nightTimeRange = CustomDate.getNightTime(new Date(date))
  const summary = new Summary(events, nightTimeRange.start, nightTimeRange.end)
  return c.json(summary)
})

app.get('api/summaries/score', async (c) => {
  const { since, until } = c.req.query() // YYYY-MM-DD, until を期間に含む
  if (!since || !until) {
    return c.json({ message: 'Bad Request' }, 400)
  }
  const customDateSince = CustomDate.getDayRange(since).start
  const customDateUntil = CustomDate.getDayRange(until).end
  const events = await eventRepo.findByDateRange(customDateSince, customDateUntil)
  // 朝6時を基準とした日付でグルーピング
  const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
    format(CustomDate.getDate(datetime), 'yyyy-MM-dd'),
  )
  const summaries = dateEventsMap.entries().map(([date, events]) => {
    const { start, end } = CustomDate.getNightTime(date)
    return new Summary(events, start, end)
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
  if (!since || !until) {
    return c.json({ message: 'Bad Request' }, 400)
  }
  const events = await eventRepo.findByDateRange(tzDate(since), addDays(tzDate(until), 1))
  // 朝6時を基準とした日付でグルーピング
  const dateEventsMap = Map.groupBy(events, ({ datetime }) =>
    format(CustomDate.getDate(datetime), 'yyyy-MM-dd'),
  )
  // untilの次の日の分のデータは不要のため削除
  dateEventsMap.delete(format(addDays(tzDate(until), 1), 'yyyy-MM-dd'))

  const summaries = dateEventsMap.entries().map(([date, events]) => {
    const { start, end } = CustomDate.getNightTime(startOfDay(tzDate(date)))
    return new Summary(events, start, end)
  })
  const sorted = Array.from(summaries).sort((a, b) => b.computeScore() - a.computeScore())
  return c.json({
    best: sorted.slice(0, Number(num)),
    worst: sorted.toReversed().slice(0, Number(num)),
  })
})

app.use('/*', serveStatic({ root: './dist' }))

serve({ fetch: app.fetch, port: 3000 })
