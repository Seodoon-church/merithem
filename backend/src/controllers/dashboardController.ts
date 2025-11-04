import { Response, NextFunction } from 'express'
import { pool } from '../config/database'
import { ApiError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const userId = req.user.userId

    // Get device count
    const deviceCount = await pool.query(
      'SELECT COUNT(*) as count FROM devices WHERE user_id = $1',
      [userId]
    )

    // Get diagnosis count
    const diagnosisCount = await pool.query(
      'SELECT COUNT(*) as count FROM skin_diagnoses WHERE user_id = $1',
      [userId]
    )

    // Get active subscription
    const subscription = await pool.query(
      `SELECT id, plan_type, status, next_billing_date
       FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    )

    // Get recent diagnoses
    const recentDiagnoses = await pool.query(
      `SELECT id, diagnosis_date, overall_score, image_url
       FROM skin_diagnoses
       WHERE user_id = $1
       ORDER BY diagnosis_date DESC
       LIMIT 5`,
      [userId]
    )

    // Get recent devices
    const recentDevices = await pool.query(
      `SELECT id, serial_number, model, nickname, status, last_sync_at
       FROM devices
       WHERE user_id = $1
       ORDER BY registered_at DESC
       LIMIT 3`,
      [userId]
    )

    res.json({
      status: 'success',
      data: {
        stats: {
          deviceCount: parseInt(deviceCount.rows[0].count),
          diagnosisCount: parseInt(diagnosisCount.rows[0].count),
          subscription: subscription.rows[0] || null,
        },
        recentDiagnoses: recentDiagnoses.rows,
        recentDevices: recentDevices.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}
