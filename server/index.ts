import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'

const app = new Hono()

// 1. API ルーティング
app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Backend!' })
})

// 2. フロントエンドのビルド成果物（dist/）を静的ファイルとして配信
app.use('/*', serveStatic({ root: './dist' }))

// サーバー起動
serve({ fetch: app.fetch, port: 3000 })
