import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { subscriptionService } from '../services/subscriptionService'

function SubscriptionPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['active-subscription'],
    queryFn: () => subscriptionService.getActiveSubscription(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, auto_renewal }: { id: string; auto_renewal: boolean }) =>
      subscriptionService.updateSubscription(id, { auto_renewal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage('구독 설정이 업데이트되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => subscriptionService.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage('구독이 취소되었습니다. 현재 기간 종료일까지 사용 가능합니다.')
    },
  })

  const handleToggleAutoRenewal = () => {
    if (!subscription) return
    updateMutation.mutate({
      id: subscription.id,
      auto_renewal: !subscription.auto_renewal,
    })
  }

  const handleCancelSubscription = () => {
    if (!subscription) return
    if (confirm('정말 구독을 취소하시겠습니까?')) {
      cancelMutation.mutate(subscription.id)
    }
  }

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 'Basic'
      case 'premium':
        return 'Premium'
      case 'enterprise':
        return 'Enterprise'
      default:
        return planType
    }
  }

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return '월간'
      case 'quarterly':
        return '분기'
      case 'yearly':
        return '연간'
      default:
        return cycle
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'cancelled':
        return '취소됨'
      case 'paused':
        return '일시정지'
      case 'expired':
        return '만료됨'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const subscription = data?.data.subscription

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">{t('loading')}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">구독 관리</h2>
          <p className="text-gray-600 mt-2">현재 구독 상태를 확인하고 관리하세요</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {!subscription ? (
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
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <p className="text-gray-500 mb-4">활성화된 구독이 없습니다</p>
            <Link to="/subscription/plans" className="btn-primary inline-block">
              구독 플랜 보기
            </Link>
          </div>
        ) : (
          <>
            <div className="card mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {getPlanName(subscription.plan_type)} 플랜
                  </h3>
                  <p className="text-gray-600">{getCycleLabel(subscription.billing_cycle)} 결제</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    subscription.status
                  )}`}
                >
                  {getStatusLabel(subscription.status)}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">구독 시작일:</span>
                  <span className="font-medium">
                    {new Date(subscription.start_date).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                {subscription.next_billing_date && subscription.status === 'active' && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">다음 결제일:</span>
                    <span className="font-medium">
                      {new Date(subscription.next_billing_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}

                {subscription.end_date && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">종료일:</span>
                    <span className="font-medium">
                      {new Date(subscription.end_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">결제 금액:</span>
                  <span className="font-medium text-lg">
                    {formatPrice(subscription.price)} {subscription.currency}
                  </span>
                </div>

                {subscription.payment_method && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">결제 수단:</span>
                    <span className="font-medium">{subscription.payment_method}</span>
                  </div>
                )}
              </div>

              {subscription.status === 'active' && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">자동 갱신</p>
                        <p className="text-sm text-gray-600">
                          구독 기간 종료 시 자동으로 갱신합니다
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={subscription.auto_renewal}
                        onChange={handleToggleAutoRenewal}
                        disabled={updateMutation.isPending}
                        className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-primary relative cursor-pointer transition-colors
                                 after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform
                                 checked:after:translate-x-6"
                      />
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Link to="/subscription/plans" className="flex-1 btn-secondary text-center">
                      플랜 변경
                    </Link>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelMutation.isPending}
                      className="flex-1 btn-secondary text-red-600 hover:bg-red-50"
                    >
                      {cancelMutation.isPending ? '처리 중...' : '구독 취소'}
                    </button>
                  </div>
                </>
              )}

              {subscription.status === 'cancelled' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                  구독이 취소되었습니다. {subscription.end_date && `${new Date(subscription.end_date).toLocaleDateString('ko-KR')}까지 계속 사용할 수 있습니다.`}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">구독 혜택</h3>
              <ul className="space-y-3">
                {subscription.plan_type === 'basic' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      디바이스 1대 등록
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      월 10회 피부 진단
                    </li>
                  </>
                )}
                {subscription.plan_type === 'premium' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      디바이스 3대 등록
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      무제한 피부 진단
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      월 1회 무료 제품
                    </li>
                  </>
                )}
                {subscription.plan_type === 'enterprise' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      무제한 디바이스 등록
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      무제한 피부 진단
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      전담 계정 매니저
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      월 3회 무료 제품
                    </li>
                  </>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default SubscriptionPage
