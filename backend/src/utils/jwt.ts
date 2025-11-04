import jwt from 'jsonwebtoken'
import { JwtPayload } from '../middleware/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '30m'
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '14d'

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION,
  })
}

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  })
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null
}

export const getTokenExpirationDate = (token: string): Date | null => {
  const decoded = decodeToken(token)
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000)
  }
  return null
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string
    email: string
    role: string
    exp?: number
    iat?: number
  }
}
