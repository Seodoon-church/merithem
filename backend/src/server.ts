import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

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

// API routes (to be implemented)
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'LUMI+ Platform API',
    version: '1.0.0',
    status: 'active',
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV}`)
})

export default app
