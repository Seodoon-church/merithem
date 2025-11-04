import { api } from './api'

export interface Order {
  id: string
  user_id: string
  order_date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  shipping_address: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_country: string
  phone_number: string
  payment_method: string
  payment_status: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id?: string
  order_id?: string
  product_id: string
  quantity: number
  price_at_time: number
  name?: string
  name_en?: string
  name_ja?: string
  image_url?: string
  category?: string
}

export interface CreateOrderData {
  shipping_address: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_country?: string
  phone_number: string
  payment_method?: string
  notes?: string
}

export interface OrderStats {
  total_orders: number
  by_status: Array<{ status: string; count: string }>
  total_spent: number
}

export const orderService = {
  async getOrders(
    filters?: { status?: string; page?: number; limit?: number }
  ): Promise<{
    status: string
    data: {
      orders: Order[]
      pagination: {
        total: number
        page: number
        limit: number
        pages: number
      }
    }
  }> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return await api.get(`/orders?${params.toString()}`)
  },

  async getOrder(id: string): Promise<{ status: string; data: { order: Order } }> {
    return await api.get(`/orders/${id}`)
  },

  async createOrder(orderData: CreateOrderData): Promise<{
    status: string
    message: string
    data: { order: Order }
  }> {
    return await api.post('/orders', orderData)
  },

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<{
    status: string
    message: string
    data: { order: Order }
  }> {
    return await api.put(`/orders/${id}/status`, { status })
  },

  async cancelOrder(id: string): Promise<{
    status: string
    message: string
    data: { order: Order }
  }> {
    return await api.post(`/orders/${id}/cancel`)
  },

  async getOrderStats(): Promise<{
    status: string
    data: OrderStats
  }> {
    return await api.get('/orders/stats')
  },
}
