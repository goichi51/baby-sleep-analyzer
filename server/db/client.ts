import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

// TODO: rc.5 でバグが修正されたらもどす
//export const db = drizzle({ connection: process.env.DATABASE_URL! })

const poolConnection = mysql.createPool(process.env.DATABASE_URL!)
export const db = drizzle({ client: poolConnection.pool })
