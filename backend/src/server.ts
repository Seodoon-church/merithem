import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import deviceRoutes from './routes/deviceRoutes'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000
const API_PREFIX = process.env.API_PREFIX || '/api/v1'

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.get(API_PREFIX, (req, res) => {
  res.json({
    message: 'LUMI+ Platform API',
    version: '1.0.0',
    status: 'active',
  })
})

// Auth routes
app.use(`${API_PREFIX}/auth`, authRoutes)

// User routes
app.use(`${API_PREFIX}/users`, userRoutes)

// Device routes
app.use(`${API_PREFIX}/devices`, deviceRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV}`)
  logger.info(`API prefix: ${API_PREFIX}`)
})

export default app
