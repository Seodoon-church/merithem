import { Response, NextFunction } from 'express'
import { pool } from '../config/database'
import { ApiError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const result = await pool.query(
      `SELECT
        u.id, u.email, u.name, u.phone, u.role, u.language, u.created_at,
        p.birth_date, p.gender, p.skin_type, p.skin_concerns, p.allergies,
        p.avatar_url, p.bio, p.address_line1, p.address_line2,
        p.city, p.state, p.postal_code, p.country
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      throw new ApiError(404, '사용자를 찾을 수 없습니다.')
    }

    res.json({
      status: 'success',
      data: {
        user: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()

  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const {
      name,
      phone,
      language,
      birth_date,
      gender,
      skin_type,
      skin_concerns,
      allergies,
      bio,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
    } = req.body

    await client.query('BEGIN')

    // Update users table
    if (name || phone || language) {
      const updateFields: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (name) {
        updateFields.push(`name = $${paramCount}`)
        values.push(name)
        paramCount++
      }
      if (phone) {
        updateFields.push(`phone = $${paramCount}`)
        values.push(phone)
        paramCount++
      }
      if (language) {
        updateFields.push(`language = $${paramCount}`)
        values.push(language)
        paramCount++
      }

      values.push(req.user.userId)

      await client.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        values
      )
    }

    // Update user_profiles table
    const profileFields: string[] = []
    const profileValues: any[] = []
    let profileParamCount = 1

    if (birth_date !== undefined) {
      profileFields.push(`birth_date = $${profileParamCount}`)
      profileValues.push(birth_date)
      profileParamCount++
    }
    if (gender !== undefined) {
      profileFields.push(`gender = $${profileParamCount}`)
      profileValues.push(gender)
      profileParamCount++
    }
    if (skin_type !== undefined) {
      profileFields.push(`skin_type = $${profileParamCount}`)
      profileValues.push(skin_type)
      profileParamCount++
    }
    if (skin_concerns !== undefined) {
      profileFields.push(`skin_concerns = $${profileParamCount}`)
      profileValues.push(skin_concerns)
      profileParamCount++
    }
    if (allergies !== undefined) {
      profileFields.push(`allergies = $${profileParamCount}`)
      profileValues.push(allergies)
      profileParamCount++
    }
    if (bio !== undefined) {
      profileFields.push(`bio = $${profileParamCount}`)
      profileValues.push(bio)
      profileParamCount++
    }
    if (address_line1 !== undefined) {
      profileFields.push(`address_line1 = $${profileParamCount}`)
      profileValues.push(address_line1)
      profileParamCount++
    }
    if (address_line2 !== undefined) {
      profileFields.push(`address_line2 = $${profileParamCount}`)
      profileValues.push(address_line2)
      profileParamCount++
    }
    if (city !== undefined) {
      profileFields.push(`city = $${profileParamCount}`)
      profileValues.push(city)
      profileParamCount++
    }
    if (state !== undefined) {
      profileFields.push(`state = $${profileParamCount}`)
      profileValues.push(state)
      profileParamCount++
    }
    if (postal_code !== undefined) {
      profileFields.push(`postal_code = $${profileParamCount}`)
      profileValues.push(postal_code)
      profileParamCount++
    }
    if (country !== undefined) {
      profileFields.push(`country = $${profileParamCount}`)
      profileValues.push(country)
      profileParamCount++
    }

    if (profileFields.length > 0) {
      profileValues.push(req.user.userId)
      await client.query(
        `UPDATE user_profiles SET ${profileFields.join(', ')} WHERE user_id = $${profileParamCount}`,
        profileValues
      )
    }

    await client.query('COMMIT')

    // Fetch updated profile
    const result = await client.query(
      `SELECT
        u.id, u.email, u.name, u.phone, u.role, u.language, u.created_at,
        p.birth_date, p.gender, p.skin_type, p.skin_concerns, p.allergies,
        p.avatar_url, p.bio, p.address_line1, p.address_line2,
        p.city, p.state, p.postal_code, p.country
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.userId]
    )

    logger.info(`Profile updated for user: ${req.user.email}`)

    res.json({
      status: 'success',
      message: '프로필이 업데이트되었습니다.',
      data: {
        user: result.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, '현재 비밀번호와 새 비밀번호를 입력해주세요.')
    }

    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.userId]
    )

    if (userResult.rows.length === 0) {
      throw new ApiError(404, '사용자를 찾을 수 없습니다.')
    }

    const { comparePassword, hashPassword, validatePassword } = await import('../utils/password')

    // Verify current password
    const isValid = await comparePassword(currentPassword, userResult.rows[0].password_hash)
    if (!isValid) {
      throw new ApiError(401, '현재 비밀번호가 올바르지 않습니다.')
    }

    // Validate new password
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      throw new ApiError(400, validation.message || '비밀번호가 유효하지 않습니다.')
    }

    // Hash and update new password
    const newPasswordHash = await hashPassword(newPassword)
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.userId]
    )

    // Revoke all refresh tokens for this user
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL',
      [req.user.userId]
    )

    logger.info(`Password changed for user: ${req.user.email}`)

    res.json({
      status: 'success',
      message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.',
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { password } = req.body

    if (!password) {
      throw new ApiError(400, '비밀번호를 입력해주세요.')
    }

    // Verify password
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.userId]
    )

    if (userResult.rows.length === 0) {
      throw new ApiError(404, '사용자를 찾을 수 없습니다.')
    }

    const { comparePassword } = await import('../utils/password')
    const isValid = await comparePassword(password, userResult.rows[0].password_hash)
    if (!isValid) {
      throw new ApiError(401, '비밀번호가 올바르지 않습니다.')
    }

    // Soft delete user (set deleted_at)
    await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.user.userId]
    )

    // Revoke all refresh tokens
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [req.user.userId]
    )

    logger.info(`Account deleted for user: ${req.user.email}`)

    res.json({
      status: 'success',
      message: '계정이 삭제되었습니다.',
    })
  } catch (error) {
    next(error)
  }
}
