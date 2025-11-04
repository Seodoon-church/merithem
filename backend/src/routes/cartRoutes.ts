import express from 'express'
import { auth } from '../middleware/auth'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController'

const router = express.Router()

// All cart routes require authentication
router.get('/', auth, getCart)
router.post('/', auth, addToCart)
router.put('/:id', auth, updateCartItem)
router.delete('/:id', auth, removeFromCart)
router.delete('/', auth, clearCart)

export default router
