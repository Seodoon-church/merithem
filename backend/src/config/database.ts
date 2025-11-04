import { Pool } from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'

dotenv.config()

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lumiplus_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('connect', () => {
  logger.info('Database connection established')
})

pool.on('error', (err) => {
  logger.error('Unexpected database error', err)
  process.exit(-1)
})

export const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    logger.info('Database connected successfully:', result.rows[0])
    client.release()
    return true
  } catch (error) {
    logger.error('Database connection failed:', error)
    return false
  }
}
