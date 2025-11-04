import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getDashboardStats } from '../controllers/dashboardController'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', getDashboardStats)

export default router
