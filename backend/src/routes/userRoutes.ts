import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/userController'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', getProfile)

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateProfile)

/**
 * @route   POST /api/v1/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', changePassword)

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account', deleteAccount)

export default router
