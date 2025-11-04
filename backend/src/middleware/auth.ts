import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from './errorHandler'
import { logger } from '../utils/logger'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided')
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined')
      throw new ApiError(500, 'Server configuration error')
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload
    req.user = decoded

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Token expired'))
    } else {
      next(error)
    }
  }
}

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: Insufficient permissions'))
    }

    next()
  }
}
