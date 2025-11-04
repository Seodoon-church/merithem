import express from 'express'
import { auth } from '../middleware/auth'
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from '../controllers/orderController'

const router = express.Router()

// All order routes require authentication
router.get('/', auth, getOrders)
router.get('/stats', auth, getOrderStats)
router.get('/:id', auth, getOrder)
router.post('/', auth, createOrder)
router.put('/:id/status', auth, updateOrderStatus)
router.post('/:id/cancel', auth, cancelOrder)

export default router
