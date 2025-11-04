import { api } from './api'

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  price: number
  currency: string
  start_date: string
  end_date?: string
  next_billing_date?: string
  auto_renewal: boolean
  payment_method?: string
  created_at: string
  updated_at?: string
  cancelled_at?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  features: string[]
  pricing: {
    monthly: number
    quarterly: number
    yearly: number
  }
  currency: string
  recommended?: boolean
}

export interface CreateSubscriptionData {
  plan_type: string
  billing_cycle: string
  payment_method?: string
}

export const subscriptionService = {
  async getPlans(): Promise<{ status: string; data: { plans: SubscriptionPlan[] } }> {
    return await api.get('/subscriptions/plans')
  },

  async getSubscriptions(): Promise<{ status: string; data: { subscriptions: Subscription[] } }> {
    return await api.get('/subscriptions')
  },

  async getActiveSubscription(): Promise<{
    status: string
    data: { subscription: Subscription | null }
  }> {
    return await api.get('/subscriptions/active')
  },

  async createSubscription(
    data: CreateSubscriptionData
  ): Promise<{ status: string; message: string; data: { subscription: Subscription } }> {
    return await api.post('/subscriptions', data)
  },

  async updateSubscription(
    id: string,
    data: { auto_renewal: boolean }
  ): Promise<{ status: string; message: string; data: { subscription: Subscription } }> {
    return await api.put(`/subscriptions/${id}`, data)
  },

  async cancelSubscription(
    id: string
  ): Promise<{ status: string; message: string; data: { subscription: Subscription } }> {
    return await api.post(`/subscriptions/${id}/cancel`)
  },
}
