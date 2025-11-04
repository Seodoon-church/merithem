import { Response, NextFunction } from 'express'
import { pool } from '../config/database'
import { ApiError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { logger } from '../utils/logger'

export const getSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const result = await pool.query(
      `SELECT id, plan_type, status, billing_cycle, price, currency,
              start_date, end_date, next_billing_date, auto_renewal,
              payment_method, created_at, updated_at
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    )

    res.json({
      status: 'success',
      data: {
        subscriptions: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const result = await pool.query(
      `SELECT id, plan_type, status, billing_cycle, price, currency,
              start_date, end_date, next_billing_date, auto_renewal,
              payment_method, created_at
       FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.userId]
    )

    res.json({
      status: 'success',
      data: {
        subscription: result.rows[0] || null,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const createSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect()

  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { plan_type, billing_cycle, payment_method } = req.body

    if (!plan_type || !billing_cycle) {
      throw new ApiError(400, '플랜 유형과 결제 주기를 선택해주세요.')
    }

    // Validate plan type
    if (!['basic', 'premium', 'enterprise'].includes(plan_type)) {
      throw new ApiError(400, '유효하지 않은 플랜 유형입니다.')
    }

    // Validate billing cycle
    if (!['monthly', 'quarterly', 'yearly'].includes(billing_cycle)) {
      throw new ApiError(400, '유효하지 않은 결제 주기입니다.')
    }

    // Check for existing active subscription
    const existingSubscription = await client.query(
      'SELECT id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [req.user.userId, 'active']
    )

    if (existingSubscription.rows.length > 0) {
      throw new ApiError(409, '이미 활성화된 구독이 있습니다.')
    }

    // Define pricing
    const pricing: { [key: string]: { [key: string]: number } } = {
      basic: { monthly: 9900, quarterly: 26700, yearly: 99000 },
      premium: { monthly: 19900, quarterly: 53700, yearly: 199000 },
      enterprise: { monthly: 39900, quarterly: 107700, yearly: 399000 },
    }

    const price = pricing[plan_type][billing_cycle]

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date(startDate)
    const nextBillingDate = new Date(startDate)

    if (billing_cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    } else if (billing_cycle === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3)
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
    }

    await client.query('BEGIN')

    const result = await client.query(
      `INSERT INTO subscriptions (
        user_id, plan_type, status, billing_cycle, price, currency,
        start_date, end_date, next_billing_date, auto_renewal, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.userId,
        plan_type,
        'active',
        billing_cycle,
        price,
        'KRW',
        startDate,
        endDate,
        nextBillingDate,
        true,
        payment_method || null,
      ]
    )

    await client.query('COMMIT')

    logger.info(`Subscription created: ${result.rows[0].id} by user ${req.user.email}`)

    res.status(201).json({
      status: 'success',
      message: '구독이 시작되었습니다.',
      data: {
        subscription: result.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

export const updateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params
    const { auto_renewal } = req.body

    // Verify ownership
    const subscriptionCheck = await pool.query(
      'SELECT id, status FROM subscriptions WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    )

    if (subscriptionCheck.rows.length === 0) {
      throw new ApiError(404, '구독을 찾을 수 없습니다.')
    }

    if (subscriptionCheck.rows[0].status !== 'active') {
      throw new ApiError(400, '활성화된 구독만 수정할 수 있습니다.')
    }

    const result = await pool.query(
      `UPDATE subscriptions
       SET auto_renewal = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [auto_renewal, id, req.user.userId]
    )

    logger.info(`Subscription updated: ${id} by user ${req.user.email}`)

    res.json({
      status: 'success',
      message: '구독 설정이 업데이트되었습니다.',
      data: {
        subscription: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const cancelSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const { id } = req.params

    // Verify ownership
    const subscriptionCheck = await pool.query(
      'SELECT id, status FROM subscriptions WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    )

    if (subscriptionCheck.rows.length === 0) {
      throw new ApiError(404, '구독을 찾을 수 없습니다.')
    }

    if (subscriptionCheck.rows[0].status !== 'active') {
      throw new ApiError(400, '이미 취소되었거나 만료된 구독입니다.')
    }

    const result = await pool.query(
      `UPDATE subscriptions
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, auto_renewal = false
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.userId]
    )

    logger.info(`Subscription cancelled: ${id} by user ${req.user.email}`)

    res.json({
      status: 'success',
      message: '구독이 취소되었습니다. 현재 기간 종료일까지 사용 가능합니다.',
      data: {
        subscription: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getSubscriptionPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        description: '개인 사용자를 위한 기본 플랜',
        features: [
          '디바이스 1대 등록',
          '월 10회 피부 진단',
          '기본 분석 리포트',
          '이메일 지원',
        ],
        pricing: {
          monthly: 9900,
          quarterly: 26700,
          yearly: 99000,
        },
        currency: 'KRW',
      },
      {
        id: 'premium',
        name: 'Premium',
        description: '프리미엄 케어를 원하는 사용자',
        features: [
          '디바이스 3대 등록',
          '무제한 피부 진단',
          '상세 분석 리포트',
          '맞춤형 제품 추천',
          '우선 고객 지원',
          '월 1회 무료 제품',
        ],
        pricing: {
          monthly: 19900,
          quarterly: 53700,
          yearly: 199000,
        },
        currency: 'KRW',
        recommended: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: '비즈니스 및 전문가용',
        features: [
          '무제한 디바이스 등록',
          '무제한 피부 진단',
          'AI 고급 분석',
          'API 접근',
          '전담 계정 매니저',
          '맞춤형 솔루션',
          '월 3회 무료 제품',
        ],
        pricing: {
          monthly: 39900,
          quarterly: 107700,
          yearly: 399000,
        },
        currency: 'KRW',
      },
    ]

    res.json({
      status: 'success',
      data: {
        plans,
      },
    })
  } catch (error) {
    next(error)
  }
}
