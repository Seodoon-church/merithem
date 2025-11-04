import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { pool } from '../config/database'

/**
 * Get all products with filtering and pagination
 */
export const getProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      min_price,
      max_price,
      search,
      sort = 'created_at',
      order = 'DESC',
      page = '1',
      limit = '12',
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build query
    let query = `
      SELECT * FROM products
      WHERE deleted_at IS NULL
    `
    const params: any[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (min_price) {
      query += ` AND price >= $${paramIndex}`
      params.push(Number(min_price))
      paramIndex++
    }

    if (max_price) {
      query += ` AND price <= $${paramIndex}`
      params.push(Number(max_price))
      paramIndex++
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Count total
    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params)
    const total = parseInt(countResult.rows[0].count)

    // Add sorting and pagination
    query += ` ORDER BY ${sort} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(Number(limit), offset)

    const result = await pool.query(query, params)

    res.status(200).json({
      status: 'success',
      data: {
        products: result.rows,
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
 * Get product by ID
 */
export const getProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
      return
    }

    res.status(200).json({
      status: 'success',
      data: {
        product: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params
    const { limit = '10', sort = 'created_at', order = 'DESC' } = req.query

    const result = await pool.query(
      `SELECT * FROM products
       WHERE category = $1 AND deleted_at IS NULL
       ORDER BY ${sort} ${order}
       LIMIT $2`,
      [category, Number(limit)]
    )

    res.status(200).json({
      status: 'success',
      data: {
        products: result.rows,
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get featured/recommended products
 */
export const getFeaturedProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = '6' } = req.query

    const result = await pool.query(
      `SELECT * FROM products
       WHERE deleted_at IS NULL AND stock_quantity > 0
       ORDER BY created_at DESC
       LIMIT $1`,
      [Number(limit)]
    )

    res.status(200).json({
      status: 'success',
      data: {
        products: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create product (Admin only - for now, any authenticated user)
 */
export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      name_en,
      name_ja,
      description,
      description_en,
      description_ja,
      category,
      price,
      currency = 'KRW',
      stock_quantity,
      image_url,
      ingredients,
      usage_instructions,
      skin_types,
    } = req.body

    if (!name || !category || !price || stock_quantity === undefined) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, category, price, stock_quantity',
      })
      return
    }

    const query = `
      INSERT INTO products (
        name, name_en, name_ja,
        description, description_en, description_ja,
        category, price, currency, stock_quantity,
        image_url, ingredients, usage_instructions, skin_types
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `

    const values = [
      name,
      name_en || null,
      name_ja || null,
      description || null,
      description_en || null,
      description_ja || null,
      category,
      price,
      currency,
      stock_quantity,
      image_url || null,
      ingredients || null,
      usage_instructions || null,
      skin_types || null,
    ]

    const result = await pool.query(query, values)

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update product (Admin only - for now, any authenticated user)
 */
export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const updateFields = req.body

    // Check if product exists
    const checkResult = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
      return
    }

    // Build dynamic update query
    const allowedFields = [
      'name',
      'name_en',
      'name_ja',
      'description',
      'description_en',
      'description_ja',
      'category',
      'price',
      'currency',
      'stock_quantity',
      'image_url',
      'ingredients',
      'usage_instructions',
      'skin_types',
    ]

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`)
        values.push(updateFields[field])
        paramIndex++
      }
    }

    if (updates.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'No valid fields to update',
      })
      return
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await pool.query(query, values)

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE products
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
      return
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
