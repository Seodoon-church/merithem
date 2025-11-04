import { Response, NextFunction } from 'express'
import { pool } from '../config/database'
import { ApiError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

export const getDiagnoses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { limit = 10, offset = 0 } = req.query

    const result = await pool.query(
      `SELECT
        sd.id, sd.diagnosis_date, sd.image_url, sd.overall_score,
        sd.moisture_level, sd.elasticity_level, sd.wrinkle_severity,
        sd.pore_size, sd.pigmentation_level, sd.redness_level, sd.acne_severity,
        sd.skin_tone, sd.detected_issues,
        d.serial_number as device_serial_number, d.model as device_model
       FROM skin_diagnoses sd
       LEFT JOIN devices d ON sd.device_id = d.id
       WHERE sd.user_id = $1
       ORDER BY sd.diagnosis_date DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    )

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM skin_diagnoses WHERE user_id = $1',
      [req.user.userId]
    )

    res.json({
      status: 'success',
      data: {
        diagnoses: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getDiagnosis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params

    const result = await pool.query(
      `SELECT
        sd.*,
        d.serial_number as device_serial_number,
        d.model as device_model,
        d.nickname as device_nickname
       FROM skin_diagnoses sd
       LEFT JOIN devices d ON sd.device_id = d.id
       WHERE sd.id = $1 AND sd.user_id = $2`,
      [id, req.user.userId]
    )

    if (result.rows.length === 0) {
      throw new ApiError(404, '진단 기록을 찾을 수 없습니다.')
    }

    res.json({
      status: 'success',
      data: {
        diagnosis: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const createDiagnosis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const {
      device_id,
      image_url,
      overall_score,
      moisture_level,
      elasticity_level,
      wrinkle_severity,
      pore_size,
      pigmentation_level,
      redness_level,
      acne_severity,
      skin_tone,
      detected_issues,
      recommendations,
      notes,
    } = req.body

    // Verify device ownership if device_id is provided
    if (device_id) {
      const deviceCheck = await pool.query(
        'SELECT id FROM devices WHERE id = $1 AND user_id = $2',
        [device_id, req.user.userId]
      )

      if (deviceCheck.rows.length === 0) {
        throw new ApiError(404, '디바이스를 찾을 수 없습니다.')
      }
    }

    const result = await pool.query(
      `INSERT INTO skin_diagnoses (
        user_id, device_id, image_url, overall_score,
        moisture_level, elasticity_level, wrinkle_severity, pore_size,
        pigmentation_level, redness_level, acne_severity,
        skin_tone, detected_issues, recommendations, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.user.userId,
        device_id || null,
        image_url || null,
        overall_score || null,
        moisture_level || null,
        elasticity_level || null,
        wrinkle_severity || null,
        pore_size || null,
        pigmentation_level || null,
        redness_level || null,
        acne_severity || null,
        skin_tone || null,
        detected_issues || null,
        recommendations || null,
        notes || null,
      ]
    )

    logger.info(`Diagnosis created: ${result.rows[0].id} by user ${req.user.email}`)

    res.status(201).json({
      status: 'success',
      message: '진단 기록이 저장되었습니다.',
      data: {
        diagnosis: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteDiagnosis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params

    // Verify ownership
    const diagnosisCheck = await pool.query(
      'SELECT id FROM skin_diagnoses WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    )

    if (diagnosisCheck.rows.length === 0) {
      throw new ApiError(404, '진단 기록을 찾을 수 없습니다.')
    }

    await pool.query('DELETE FROM skin_diagnoses WHERE id = $1 AND user_id = $2', [
      id,
      req.user.userId,
    ])

    logger.info(`Diagnosis deleted: ${id} by user ${req.user.email}`)

    res.json({
      status: 'success',
      message: '진단 기록이 삭제되었습니다.',
    })
  } catch (error) {
    next(error)
  }
}

export const getDiagnosisStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    // Get average scores over time
    const averageScores = await pool.query(
      `SELECT
        DATE(diagnosis_date) as date,
        AVG(overall_score) as avg_overall_score,
        AVG(moisture_level) as avg_moisture,
        AVG(elasticity_level) as avg_elasticity,
        AVG(wrinkle_severity) as avg_wrinkles
       FROM skin_diagnoses
       WHERE user_id = $1 AND diagnosis_date >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(diagnosis_date)
       ORDER BY date DESC`,
      [req.user.userId]
    )

    // Get latest diagnosis
    const latestDiagnosis = await pool.query(
      `SELECT * FROM skin_diagnoses
       WHERE user_id = $1
       ORDER BY diagnosis_date DESC
       LIMIT 1`,
      [req.user.userId]
    )

    res.json({
      status: 'success',
      data: {
        averageScores: averageScores.rows,
        latestDiagnosis: latestDiagnosis.rows[0] || null,
      },
    })
  } catch (error) {
    next(error)
  }
}
