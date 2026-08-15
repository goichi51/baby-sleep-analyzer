import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { EventRepository } from './repository/EventRepository.ts'
import { db } from './db/client.ts'
import { DiaryRepository } from './repository/DiaryRepository.ts'
import { StateRepository } from './repository/StateRepository.ts'
import { SummaryService } from './domain/service/SummaryService.ts'
import { LogService } from './domain/service/LogService.ts'
import { ClimateLogRepository } from './repository/ClimateLogRepository.ts'

const app = new Hono()
const eventRepo = new EventRepository(db)
const diaryRepo = new DiaryRepository(db)
const stateRepo = new StateRepository(db)
const climateLogRepo = new ClimateLogRepository(db)

const summaryService = new SummaryService(eventRepo, climateLogRepo, stateRepo)
const logService = new LogService(eventRepo, diaryRepo, stateRepo, climateLogRepo, db)

/**
 * ぴよログのデータをインポートする
 */
app.post('api/logs/childcare', async (c) => {
  const req = await c.req.json<{ text: string }>()
  await logService.createChildcareLog(req.text)
  return c.json({ result: 'ok' })
})

/**
 * switch bot のデータをインポートする
 */
app.post('api/logs/climate', async (c) => {
  const req = await c.req.json<{ text: string }>()
  await logService.createClimateLog(req.text)
  return c.json({ result: 'ok' })
})

/**
 * date で指定された日の出来事を取得する
 */
app.get('api/logs/childcare', async (c) => {
  const { date } = c.req.query() // YYYY-MM-DD
  const log = await logService.findChildcareLogByDate(new Date(date))
  if (log === null) {
    return c.json({ message: 'Not Found' }, 404)
  }
  return c.json(log)
})

/**
 * date で指定された日の気温湿度データを取得する
 */
app.get('api/logs/climate', async (c) => {
  const { date } = c.req.query() // YYYY-MM-DD
  const log = await logService.findNightClimateLogByDate(new Date(date))
  if (log === null) {
    return c.json({ message: 'Not Found' }, 404)
  }
  return c.json(log)
})

app.get('api/summaries', async (c) => {
  const { date, since, until } = c.req.query() // YYYY-MM-DD
  if (!date && !(since && until)) {
    return c.json({ message: 'Bad Request' }, 400)
  }
  if (date) {
    const summaries = await summaryService.findByDate(new Date(date), new Date(date))
    if (summaries.length === 0) {
      return c.json({ message: 'Not Found' }, 404)
    }
    return c.json(summaries[0])
  }
  return c.json(await summaryService.findByDate(new Date(since), new Date(until)))
})

app.get('api/summaries/score', async (c) => {
  const { since, until } = c.req.query() // YYYY-MM-DD, until を期間に含む
  if (!since || !until) {
    return c.json({ message: 'Bad Request' }, 400)
  }
  return c.json(await summaryService.getScores(new Date(since), new Date(until)))
})

/**
 * 朝6時を基準として日毎に睡眠のスコアを集計し、上位/下位 num 個のデータを返す、
 */
app.get('api/summaries/ranking', async (c) => {
  const { since, until, num = 3 } = c.req.query() // YYYY-MM-DD, until を含む
  if (!since || !until) {
    return c.json({ message: 'Bad Request' }, 400)
  }
  return c.json(summaryService.getRanking(new Date(since), new Date(until), Number(num)))
})

app.use('/*', serveStatic({ root: './dist' }))

serve({ fetch: app.fetch, port: 3000 })
