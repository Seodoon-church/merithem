import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { cartService, CartItem } from '../services/cartService'

function CartPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  // Fetch cart
  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  })

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setMessage('제품이 제거되었습니다')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setMessage('장바구니가 비워졌습니다')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta
    if (newQuantity >= 1 && newQuantity <= item.stock_quantity) {
      updateMutation.mutate({ itemId: item.id, quantity: newQuantity })
    }
  }

  const handleRemove = (itemId: string) => {
    if (confirm('이 제품을 장바구니에서 제거하시겠습니까?')) {
      removeMutation.mutate(itemId)
    }
  }

  const handleClearCart = () => {
    if (confirm('장바구니를 비우시겠습니까?')) {
      clearMutation.mutate()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getProductName = (item: CartItem) => {
    const lang = i18n.language
    if (lang === 'en' && item.name_en) return item.name_en
    if (lang === 'ja' && item.name_ja) return item.name_ja
    return item.name
  }

  const items = data?.data.items || []
  const summary = data?.data.summary

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">로딩 중...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">장바구니</h2>
            <p className="text-gray-600 mt-2">
              {summary?.item_count || 0}개의 제품이 담겨있습니다
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={clearMutation.isPending}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              전체 삭제
            </button>
          )}
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {items.length === 0 ? (
          <div className="card text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다</p>
            <Link to="/products" className="btn-primary inline-block">
              제품 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={getProductName(item)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link to={`/products/${item.product_id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-primary mb-1">
                          {getProductName(item)}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-3 capitalize">{item.category}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={item.quantity <= 1 || updateMutation.isPending}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            disabled={
                              item.quantity >= item.stock_quantity || updateMutation.isPending
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}원
                          </p>
                          <p className="text-xs text-gray-500">
                            단가: {formatPrice(item.price)}원
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removeMutation.isPending}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-lg font-semibold mb-4">주문 요약</h3>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">상품 수량</span>
                    <span className="font-medium">{summary?.total_quantity || 0}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-medium">
                      {formatPrice(summary?.subtotal || 0)}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">배송비</span>
                    <span className="font-medium text-green-600">무료</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold">총 금액</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(summary?.subtotal || 0)}원
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary mb-3"
                >
                  주문하기
                </button>

                <Link to="/products" className="block text-center text-primary text-sm">
                  쇼핑 계속하기
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CartPage
