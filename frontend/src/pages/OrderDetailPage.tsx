import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@antml:react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { orderService } from '../services/orderService'

function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id!),
    enabled: !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setMessage('주문이 취소되었습니다')
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: '결제 대기',
      processing: '처리 중',
      shipped: '배송 중',
      delivered: '배송 완료',
      cancelled: '취소됨',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getProductName = (item: any) => {
    const lang = i18n.language
    if (lang === 'en' && item.name_en) return item.name_en
    if (lang === 'ja' && item.name_ja) return item.name_ja
    return item.name
  }

  const handleCancelOrder = () => {
    if (confirm('정말 주문을 취소하시겠습니까?')) {
      cancelMutation.mutate()
    }
  }

  const order = data?.data.order

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">로딩 중...</div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 mb-4">주문을 찾을 수 없습니다</p>
          <button onClick={() => navigate('/orders')} className="btn-primary">
            주문 목록으로
          </button>
        </div>
      </Layout>
    )
  }

  const canCancel = order.status === 'pending' || order.status === 'processing'

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          주문 목록으로
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">주문 상세</h2>
            <p className="text-gray-600 mt-2">주문번호: {order.id}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">주문 상품</h3>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{getProductName(item)}</h4>
                      <p className="text-sm text-gray-500 capitalize mb-1">{item.category}</p>
                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.price_at_time * item.quantity)}원
                      </p>
                      <p className="text-xs text-gray-500">
                        단가: {formatPrice(item.price_at_time)}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">배송 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">받는 사람</span>
                  <span className="font-medium">{order.phone_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">배송 주소</span>
                  <span className="font-medium text-right">
                    {order.shipping_address}, {order.shipping_city}
                    {order.shipping_state && `, ${order.shipping_state}`}
                    {order.shipping_postal_code && ` (${order.shipping_postal_code})`}
                  </span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">운송장 번호</span>
                    <span className="font-medium">{order.tracking_number}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="py-2">
                    <p className="text-gray-600 mb-1">배송 메모</p>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">결제 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">결제 방법</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">결제 상태</span>
                  <span className="font-medium">{order.payment_status}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">주문 일시</span>
                  <span className="font-medium">
                    {new Date(order.order_date).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="text-lg font-semibold mb-4">결제 금액</h3>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 금액</span>
                  <span className="font-medium">{formatPrice(order.total_amount)}원</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-semibold">총 결제 금액</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(order.total_amount)}원
                </span>
              </div>

              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelMutation.isPending}
                  className="w-full btn-secondary text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelMutation.isPending ? '처리 중...' : '주문 취소'}
                </button>
              )}

              {order.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                  주문이 취소되었습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default OrderDetailPage
