import { Response, NextFunction } from 'express'
import { pool } from '../config/database'
import { ApiError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

export const getDevices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const result = await pool.query(
      `SELECT id, serial_number, model, firmware_version, status,
              nickname, last_sync_at, registered_at, warranty_expires_at, created_at
       FROM devices
       WHERE user_id = $1
       ORDER BY registered_at DESC`,
      [req.user.userId]
    )

    res.json({
      status: 'success',
      data: {
        devices: result.rows,
        total: result.rows.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params

    const result = await pool.query(
      `SELECT id, serial_number, model, firmware_version, status,
              nickname, last_sync_at, registered_at, warranty_expires_at, created_at, updated_at
       FROM devices
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    )

    if (result.rows.length === 0) {
      throw new ApiError(404, '디바이스를 찾을 수 없습니다.')
    }

    res.json({
      status: 'success',
      data: {
        device: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const registerDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { serial_number, model, nickname } = req.body

    if (!serial_number || !model) {
      throw new ApiError(400, '시리얼 번호와 모델명은 필수 항목입니다.')
    }

    // Check if device is already registered
    const existingDevice = await pool.query(
      'SELECT id, user_id FROM devices WHERE serial_number = $1',
      [serial_number]
    )

    if (existingDevice.rows.length > 0) {
      if (existingDevice.rows[0].user_id === req.user.userId) {
        throw new ApiError(409, '이미 등록된 디바이스입니다.')
      } else {
        throw new ApiError(409, '다른 사용자에게 이미 등록된 디바이스입니다.')
      }
    }

    // Set warranty expiration date (2 years from registration)
    const warrantyExpiresAt = new Date()
    warrantyExpiresAt.setFullYear(warrantyExpiresAt.getFullYear() + 2)

    const result = await pool.query(
      `INSERT INTO devices (user_id, serial_number, model, nickname, status, warranty_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, serial_number, model, firmware_version, status, nickname,
                 registered_at, warranty_expires_at, created_at`,
      [req.user.userId, serial_number, model, nickname || null, 'active', warrantyExpiresAt]
    )

    logger.info(`Device registered: ${serial_number} by user ${req.user.email}`)

    res.status(201).json({
      status: 'success',
      message: '디바이스가 등록되었습니다.',
      data: {
        device: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params
    const { nickname, status } = req.body

    // Verify ownership
    const deviceCheck = await pool.query(
      'SELECT id FROM devices WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    )

    if (deviceCheck.rows.length === 0) {
      throw new ApiError(404, '디바이스를 찾을 수 없습니다.')
    }

    const updateFields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (nickname !== undefined) {
      updateFields.push(`nickname = $${paramCount}`)
      values.push(nickname)
      paramCount++
    }

    if (status !== undefined) {
      if (!['active', 'inactive', 'maintenance', 'retired'].includes(status)) {
        throw new ApiError(400, '유효하지 않은 상태값입니다.')
      }
      updateFields.push(`status = $${paramCount}`)
      values.push(status)
      paramCount++
    }

    if (updateFields.length === 0) {
      throw new ApiError(400, '업데이트할 항목이 없습니다.')
    }

    values.push(id)
    values.push(req.user.userId)

    const result = await pool.query(
      `UPDATE devices
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING id, serial_number, model, firmware_version, status, nickname,
                 last_sync_at, registered_at, warranty_expires_at, updated_at`,
      values
    )

    logger.info(`Device updated: ${id} by user ${req.user.email}`)

    res.json({
      status: 'success',
      message: '디바이스가 업데이트되었습니다.',
      data: {
        device: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params

    // Verify ownership
    const deviceCheck = await pool.query(
      'SELECT serial_number FROM devices WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    )

    if (deviceCheck.rows.length === 0) {
      throw new ApiError(404, '디바이스를 찾을 수 없습니다.')
    }

    await pool.query('DELETE FROM devices WHERE id = $1 AND user_id = $2', [id, req.user.userId])

    logger.info(`Device deleted: ${deviceCheck.rows[0].serial_number} by user ${req.user.email}`)

    res.json({
      status: 'success',
      message: '디바이스가 삭제되었습니다.',
    })
  } catch (error) {
    next(error)
  }
}

export const syncDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params

    // Verify ownership
    const deviceCheck = await pool.query(
      'SELECT id FROM devices WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    )

    if (deviceCheck.rows.length === 0) {
      throw new ApiError(404, '디바이스를 찾을 수 없습니다.')
    }

    // Update last sync time
    const result = await pool.query(
      `UPDATE devices
       SET last_sync_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id, serial_number, model, last_sync_at`,
      [id, req.user.userId]
    )

    logger.info(`Device synced: ${id} by user ${req.user.email}`)

    res.json({
      status: 'success',
      message: '디바이스가 동기화되었습니다.',
      data: {
        device: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}
