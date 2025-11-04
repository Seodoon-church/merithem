import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { pool } from '../config/database'

/**
 * Get user's cart
 */
export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId

    const result = await pool.query(
      `SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        ci.added_at,
        p.name,
        p.name_en,
        p.name_ja,
        p.description,
        p.category,
        p.price,
        p.currency,
        p.stock_quantity,
        p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.deleted_at IS NULL
      ORDER BY ci.added_at DESC`,
      [userId]
    )

    // Calculate totals
    const items = result.rows
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    res.status(200).json({
      status: 'success',
      data: {
        items,
        summary: {
          item_count: items.length,
          total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          currency: items[0]?.currency || 'KRW',
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add item to cart
 */
export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { product_id, quantity = 1 } = req.body

    if (!product_id) {
      res.status(400).json({
        status: 'error',
        message: 'Product ID is required',
      })
      return
    }

    if (quantity < 1) {
      res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1',
      })
      return
    }

    // Check if product exists and has stock
    const productCheck = await pool.query(
      'SELECT id, stock_quantity FROM products WHERE id = $1 AND deleted_at IS NULL',
      [product_id]
    )

    if (productCheck.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
      return
    }

    const product = productCheck.rows[0]

    if (product.stock_quantity < quantity) {
      res.status(400).json({
        status: 'error',
        message: 'Insufficient stock',
      })
      return
    }

    // Check if item already in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    )

    let result

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity

      if (product.stock_quantity < newQuantity) {
        res.status(400).json({
          status: 'error',
          message: 'Insufficient stock for requested quantity',
        })
        return
      }

      result = await pool.query(
        `UPDATE cart_items
         SET quantity = $1, added_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [newQuantity, existingItem.rows[0].id]
      )
    } else {
      // Add new item
      result = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, product_id, quantity]
      )
    }

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: {
        cart_item: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      res.status(400).json({
        status: 'error',
        message: 'Valid quantity is required',
      })
      return
    }

    // Check ownership and get product info
    const cartItemCheck = await pool.query(
      `SELECT ci.id, ci.product_id, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.user_id = $2 AND p.deleted_at IS NULL`,
      [id, userId]
    )

    if (cartItemCheck.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      })
      return
    }

    const { stock_quantity } = cartItemCheck.rows[0]

    if (stock_quantity < quantity) {
      res.status(400).json({
        status: 'error',
        message: 'Insufficient stock',
      })
      return
    }

    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $1, added_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [quantity, id]
    )

    res.status(200).json({
      status: 'success',
      message: 'Cart item updated',
      data: {
        cart_item: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Remove item from cart
 */
export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      })
      return
    }

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Clear cart
 */
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId])

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
    })
  } catch (error) {
    next(error)
  }
}
