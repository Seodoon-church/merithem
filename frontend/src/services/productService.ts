import { api } from './api'

export interface Product {
  id: string
  name: string
  name_en?: string
  name_ja?: string
  description?: string
  description_en?: string
  description_ja?: string
  category: string
  price: number
  currency: string
  stock_quantity: number
  image_url?: string
  ingredients?: string[]
  usage_instructions?: string
  skin_types?: string[]
  created_at: string
  updated_at?: string
}

export interface ProductFilters {
  category?: string
  min_price?: number
  max_price?: number
  search?: string
  sort?: string
  order?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}

export const productService = {
  async getProducts(
    filters?: ProductFilters
  ): Promise<{
    status: string
    data: {
      products: Product[]
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

    return await api.get(`/products?${params.toString()}`)
  },

  async getProduct(id: string): Promise<{ status: string; data: { product: Product } }> {
    return await api.get(`/products/${id}`)
  },

  async getProductsByCategory(
    category: string,
    limit = 10
  ): Promise<{ status: string; data: { products: Product[]; category: string } }> {
    return await api.get(`/products/category/${category}?limit=${limit}`)
  },

  async getFeaturedProducts(
    limit = 6
  ): Promise<{ status: string; data: { products: Product[] } }> {
    return await api.get(`/products/featured?limit=${limit}`)
  },

  async createProduct(productData: Partial<Product>): Promise<{
    status: string
    message: string
    data: { product: Product }
  }> {
    return await api.post('/products', productData)
  },

  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<{
    status: string
    message: string
    data: { product: Product }
  }> {
    return await api.put(`/products/${id}`, productData)
  },

  async deleteProduct(id: string): Promise<{ status: string; message: string }> {
    return await api.delete(`/products/${id}`)
  },
}
