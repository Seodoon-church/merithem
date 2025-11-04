import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import FormData from 'form-data'
import axios from 'axios'
import { pool } from '../config/database'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001'

/**
 * Analyze skin image using AI service
 */
export const analyzeSkinImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No image file uploaded',
      })
      return
    }

    // Forward image to AI service
    const formData = new FormData()
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/analysis/skin`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    })

    const analysisResult = aiResponse.data.data

    // If device_id is provided, save the diagnosis
    if (req.body.device_id) {
      const { device_id } = req.body

      // Verify device ownership
      const deviceCheck = await pool.query(
        'SELECT id FROM devices WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [device_id, userId]
      )

      if (deviceCheck.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Device not found or access denied',
        })
        return
      }

      // Save diagnosis to database
      const diagnosisQuery = `
        INSERT INTO diagnoses (
          user_id, device_id, diagnosis_date,
          moisture_score, elasticity_score, wrinkles_score,
          pores_score, pigmentation_score, redness_score, acne_score,
          recommendations, image_url
        ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `

      const diagnosisValues = [
        userId,
        device_id,
        analysisResult.scores.moisture,
        analysisResult.scores.elasticity,
        analysisResult.scores.wrinkles,
        analysisResult.scores.pores,
        analysisResult.scores.pigmentation,
        analysisResult.scores.redness,
        analysisResult.scores.acne,
        JSON.stringify(analysisResult.recommendations),
        `/uploads/diagnoses/${req.file.filename || Date.now()}.jpg`,
      ]

      const diagnosisResult = await pool.query(diagnosisQuery, diagnosisValues)

      res.status(201).json({
        status: 'success',
        message: 'Skin analysis completed and saved',
        data: {
          diagnosis: diagnosisResult.rows[0],
          analysis: analysisResult,
        },
      })
    } else {
      // Return analysis without saving
      res.status(200).json({
        status: 'success',
        message: 'Skin analysis completed',
        data: analysisResult,
      })
    }
  } catch (error: any) {
    if (error.response?.status) {
      res.status(error.response.status).json({
        status: 'error',
        message: error.response.data?.message || 'AI service error',
      })
    } else {
      next(error)
    }
  }
}

/**
 * Quick skin scan (lightweight analysis)
 */
export const quickSkinScan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No image file uploaded',
      })
      return
    }

    // Forward image to AI service for quick scan
    const formData = new FormData()
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/analysis/quick-scan`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 15000, // 15 second timeout for quick scan
    })

    res.status(200).json({
      status: 'success',
      message: 'Quick scan completed',
      data: aiResponse.data.data,
    })
  } catch (error: any) {
    if (error.response?.status) {
      res.status(error.response.status).json({
        status: 'error',
        message: error.response.data?.message || 'AI service error',
      })
    } else {
      next(error)
    }
  }
}

/**
 * Get AI service health status
 */
export const getAIServiceHealth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const healthResponse = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    })

    res.status(200).json({
      status: 'success',
      message: 'AI service is healthy',
      data: healthResponse.data,
    })
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      message: 'AI service is unavailable',
    })
  }
}
