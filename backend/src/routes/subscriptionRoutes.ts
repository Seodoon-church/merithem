import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getSubscriptions,
  getActiveSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionPlans,
} from '../controllers/subscriptionController'

const router = Router()

// Public route
/**
 * @route   GET /api/v1/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', getSubscriptionPlans)

// All routes below require authentication
router.use(authMiddleware)

/**
 * @route   GET /api/v1/subscriptions
 * @desc    Get all subscriptions for current user
 * @access  Private
 */
router.get('/', getSubscriptions)

/**
 * @route   GET /api/v1/subscriptions/active
 * @desc    Get active subscription
 * @access  Private
 */
router.get('/active', getActiveSubscription)

/**
 * @route   POST /api/v1/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
router.post('/', createSubscription)

/**
 * @route   PUT /api/v1/subscriptions/:id
 * @desc    Update subscription settings
 * @access  Private
 */
router.put('/:id', updateSubscription)

/**
 * @route   POST /api/v1/subscriptions/:id/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/:id/cancel', cancelSubscription)

export default router
