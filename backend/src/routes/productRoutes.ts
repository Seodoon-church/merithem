import express from 'express'
import { auth } from '../middleware/auth'
import {
  getProducts,
  getProduct,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'

const router = express.Router()

// Public routes
router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/category/:category', getProductsByCategory)
router.get('/:id', getProduct)

// Protected routes (authenticated users)
router.post('/', auth, createProduct)
router.put('/:id', auth, updateProduct)
router.delete('/:id', auth, deleteProduct)

export default router
