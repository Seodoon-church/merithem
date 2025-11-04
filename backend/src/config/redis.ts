import { createClient } from 'redis'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'

dotenv.config()

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
})

redisClient.on('connect', () => {
  logger.info('Redis connection established')
})

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err)
})

export const connectRedis = async () => {
  try {
    await redisClient.connect()
    logger.info('Redis connected successfully')
  } catch (error) {
    logger.error('Redis connection failed:', error)
  }
}
