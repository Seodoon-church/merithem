import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { pool } from '../config/database'

/**
 * Get user's orders
 */
export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { status, page = '1', limit = '10' } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    let query = `
      SELECT * FROM orders
      WHERE user_id = $1
    `
    const params: any[] = [userId]
    let paramIndex = 2

    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Count total
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*)'),
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Add pagination
    query += ` ORDER BY order_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(Number(limit), offset)

    const result = await pool.query(query, params)

    res.status(200).json({
      status: 'success',
      data: {
        orders: result.rows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get order by ID
 */
export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    // Get order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (orderResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
      })
      return
    }

    const order = orderResult.rows[0]

    // Get order items with product details
    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.name,
        p.name_en,
        p.name_ja,
        p.image_url,
        p.category
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [id]
    )

    res.status(200).json({
      status: 'success',
      data: {
        order: {
          ...order,
          items: itemsResult.rows,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create order from cart
 */
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()

  try {
    const userId = req.user?.userId
    const {
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country = 'KR',
      phone_number,
      payment_method = 'card',
      notes,
    } = req.body

    if (!shipping_address || !shipping_city || !phone_number) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required shipping information',
      })
      return
    }

    await client.query('BEGIN')

    // Get cart items with product details
    const cartResult = await client.query(
      `SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.deleted_at IS NULL`,
      [userId]
    )

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(400).json({
        status: 'error',
        message: 'Cart is empty',
      })
      return
    }

    const items = cartResult.rows

    // Check stock availability
    for (const item of items) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK')
        res.status(400).json({
          status: 'error',
          message: `Insufficient stock for product: ${item.name}`,
        })
        return
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping_fee = subtotal >= 50000 ? 0 : 3000 // Free shipping over 50,000 KRW
    const total_amount = subtotal + shipping_fee

    // Create order
    const orderQuery = `
      INSERT INTO orders (
        user_id, order_date, status,
        total_amount, currency,
        shipping_address, shipping_city, shipping_state,
        shipping_postal_code, shipping_country,
        phone_number, payment_method, payment_status, notes
      ) VALUES ($1, NOW(), 'pending', $2, 'KRW', $3, $4, $5, $6, $7, $8, $9, 'pending', $10)
      RETURNING *
    `

    const orderValues = [
      userId,
      total_amount,
      shipping_address,
      shipping_city,
      shipping_state || null,
      shipping_postal_code || null,
      shipping_country,
      phone_number,
      payment_method,
      notes || null,
    ]

    const orderResult = await client.query(orderQuery, orderValues)
    const order = orderResult.rows[0]

    // Create order items and update stock
    for (const item of items) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      )

      // Update product stock
      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      )
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId])

    await client.query('COMMIT')

    // Get complete order with items
    const completeOrderResult = await pool.query(
      `SELECT
        o.*,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'name', p.name
          )
        ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [order.id]
    )

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order: completeOrderResult.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

/**
 * Update order status
 */
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      })
      return
    }

    // Check ownership
    const checkResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
      })
      return
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    res.status(200).json({
      status: 'success',
      message: 'Order status updated',
      data: {
        order: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Cancel order
 */
export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()

  try {
    const userId = req.user?.userId
    const { id } = req.params

    await client.query('BEGIN')

    // Check ownership and current status
    const orderResult = await client.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
      })
      return
    }

    const order = orderResult.rows[0]

    if (order.status === 'shipped' || order.status === 'delivered') {
      await client.query('ROLLBACK')
      res.status(400).json({
        status: 'error',
        message: 'Cannot cancel order that has been shipped or delivered',
      })
      return
    }

    if (order.status === 'cancelled') {
      await client.query('ROLLBACK')
      res.status(400).json({
        status: 'error',
        message: 'Order is already cancelled',
      })
      return
    }

    // Get order items
    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    )

    // Restore stock
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity + $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      )
    }

    // Update order status
    const result = await client.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    await client.query('COMMIT')

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order: result.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

/**
 * Get order statistics for dashboard
 */
export const getOrderStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId

    // Total orders
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [userId]
    )

    // Orders by status
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM orders
       WHERE user_id = $1
       GROUP BY status`,
      [userId]
    )

    // Total spent
    const spentResult = await pool.query(
      `SELECT SUM(total_amount) as total_spent
       FROM orders
       WHERE user_id = $1 AND status != 'cancelled'`,
      [userId]
    )

    res.status(200).json({
      status: 'success',
      data: {
        total_orders: parseInt(totalResult.rows[0].total),
        by_status: statusResult.rows,
        total_spent: parseFloat(spentResult.rows[0].total_spent || 0),
      },
    })
  } catch (error) {
    next(error)
  }
}
