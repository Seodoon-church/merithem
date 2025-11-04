import { Request, Response, NextFunction } from 'express'
import { pool } from '../config/database'
import { ApiError } from '../middleware/errorHandler'
import { hashPassword, comparePassword, validatePassword } from '../utils/password'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt'
import { logger } from '../utils/logger'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect()

  try {
    const { email, password, name, phone, language } = req.body

    // Validation
    if (!email || !password || !name) {
      throw new ApiError(400, '이메일, 비밀번호, 이름은 필수 항목입니다.')
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw new ApiError(400, passwordValidation.message || '비밀번호가 유효하지 않습니다.')
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw new ApiError(409, '이미 등록된 이메일입니다.')
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Begin transaction
    await client.query('BEGIN')

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, name, phone, language, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, phone, language, role, status, created_at`,
      [email, passwordHash, name, phone || null, language || 'ko', 'user', 'active']
    )

    const user = userResult.rows[0]

    // Create user profile
    await client.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [user.id]
    )

    // Commit transaction
    await client.query('COMMIT')

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Store refresh token
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    await client.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    )

    logger.info(`New user registered: ${user.email}`)

    res.status(201).json({
      status: 'success',
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          language: user.language,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      throw new ApiError(400, '이메일과 비밀번호를 입력해주세요.')
    }

    // Find user
    const userResult = await pool.query(
      `SELECT id, email, password_hash, name, phone, role, status, language
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    )

    if (userResult.rows.length === 0) {
      throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const user = userResult.rows[0]

    // Check user status
    if (user.status !== 'active') {
      throw new ApiError(403, '비활성화된 계정입니다. 관리자에게 문의하세요.')
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash)
    if (!isPasswordValid) {
      throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Store refresh token
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    )

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    logger.info(`User logged in: ${user.email}`)

    res.json({
      status: 'success',
      message: '로그인 되었습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          language: user.language,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token이 필요합니다.')
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken)

    // Check if refresh token exists and is not revoked
    const tokenResult = await pool.query(
      `SELECT id, user_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token = $1`,
      [refreshToken]
    )

    if (tokenResult.rows.length === 0) {
      throw new ApiError(401, '유효하지 않은 refresh token입니다.')
    }

    const tokenRecord = tokenResult.rows[0]

    if (tokenRecord.revoked_at) {
      throw new ApiError(401, 'Refresh token이 폐기되었습니다.')
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new ApiError(401, 'Refresh token이 만료되었습니다.')
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, email, role, status FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    )

    if (userResult.rows.length === 0) {
      throw new ApiError(401, '사용자를 찾을 수 없습니다.')
    }

    const user = userResult.rows[0]

    if (user.status !== 'active') {
      throw new ApiError(403, '비활성화된 계정입니다.')
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(tokenPayload)

    logger.info(`Access token refreshed for user: ${user.email}`)

    res.json({
      status: 'success',
      message: 'Access token이 갱신되었습니다.',
      data: {
        accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token이 필요합니다.')
    }

    // Revoke refresh token
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = $1',
      [refreshToken]
    )

    logger.info('User logged out')

    res.json({
      status: 'success',
      message: '로그아웃 되었습니다.',
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new ApiError(401, 'Authorization header가 필요합니다.')
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const userResult = await pool.query(
      `SELECT u.id, u.email, u.name, u.phone, u.role, u.status, u.language,
              p.birth_date, p.gender, p.skin_type, p.avatar_url
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [decoded.userId]
    )

    if (userResult.rows.length === 0) {
      throw new ApiError(404, '사용자를 찾을 수 없습니다.')
    }

    const user = userResult.rows[0]

    res.json({
      status: 'success',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}
