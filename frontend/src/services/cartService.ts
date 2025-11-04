import { api } from './api'
import { Product } from './productService'

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  added_at: string
  name: string
  name_en?: string
  name_ja?: string
  description?: string
  category: string
  price: number
  currency: string
  stock_quantity: number
  image_url?: string
}

export interface CartSummary {
  item_count: number
  total_quantity: number
  subtotal: number
  currency: string
}

export const cartService = {
  async getCart(): Promise<{
    status: string
    data: {
      items: CartItem[]
      summary: CartSummary
    }
  }> {
    return await api.get('/cart')
  },

  async addToCart(
    productId: string,
    quantity: number = 1
  ): Promise<{
    status: string
    message: string
    data: { cart_item: any }
  }> {
    return await api.post('/cart', {
      product_id: productId,
      quantity,
    })
  },

  async updateCartItem(
    itemId: string,
    quantity: number
  ): Promise<{
    status: string
    message: string
    data: { cart_item: any }
  }> {
    return await api.put(`/cart/${itemId}`, { quantity })
  },

  async removeFromCart(itemId: string): Promise<{ status: string; message: string }> {
    return await api.delete(`/cart/${itemId}`)
  },

  async clearCart(): Promise<{ status: string; message: string }> {
    return await api.delete('/cart')
  },
}
