import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getDevices,
  getDevice,
  registerDevice,
  updateDevice,
  deleteDevice,
  syncDevice,
} from '../controllers/deviceController'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @route   GET /api/v1/devices
 * @desc    Get all devices for current user
 * @access  Private
 */
router.get('/', getDevices)

/**
 * @route   GET /api/v1/devices/:id
 * @desc    Get device by ID
 * @access  Private
 */
router.get('/:id', getDevice)

/**
 * @route   POST /api/v1/devices
 * @desc    Register a new device
 * @access  Private
 */
router.post('/', registerDevice)

/**
 * @route   PUT /api/v1/devices/:id
 * @desc    Update device
 * @access  Private
 */
router.put('/:id', updateDevice)

/**
 * @route   DELETE /api/v1/devices/:id
 * @desc    Delete device
 * @access  Private
 */
router.delete('/:id', deleteDevice)

/**
 * @route   POST /api/v1/devices/:id/sync
 * @desc    Sync device (update last_sync_at)
 * @access  Private
 */
router.post('/:id/sync', syncDevice)

export default router
