import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { subscriptionService, SubscriptionPlan } from '../services/subscriptionService'

function SubscriptionPlansPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionService.getPlans(),
  })

  const { data: activeSubscriptionData } = useQuery({
    queryKey: ['active-subscription'],
    queryFn: () => subscriptionService.getActiveSubscription(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { plan_type: string; billing_cycle: string }) =>
      subscriptionService.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-subscription'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage('구독이 시작되었습니다!')
      setSelectedPlan(null)
      setTimeout(() => {
        navigate('/subscription')
      }, 2000)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || '구독 신청에 실패했습니다.')
    },
  })

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setError('')
  }

  const handleConfirmSubscription = () => {
    if (!selectedPlan) return

    createMutation.mutate({
      plan_type: selectedPlan.id,
      billing_cycle: billingCycle,
    })
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const plans = plansData?.data.plans || []
  const hasActiveSubscription = activeSubscriptionData?.data.subscription !== null

  if (plansLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">{t('loading')}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">구독 플랜</h2>
          <p className="text-xl text-gray-600">
            당신의 피부 케어 목표에 맞는 최적의 플랜을 선택하세요
          </p>
        </div>

        {hasActiveSubscription && (
          <div className="mb-8 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg text-center">
            이미 활성화된 구독이 있습니다.{' '}
            <button
              onClick={() => navigate('/subscription')}
              className="underline font-medium hover:text-blue-900"
            >
              구독 관리 페이지로 이동
            </button>
          </div>
        )}

        {message && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                plan.recommended ? 'ring-2 ring-primary shadow-xl' : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    추천
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.pricing.monthly)}
                  </span>
                  <span className="text-gray-600 ml-2">원/월</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  연간 결제 시 {formatPrice(plan.pricing.yearly)}원
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={hasActiveSubscription || createMutation.isPending}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  plan.recommended
                    ? 'btn-primary'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {hasActiveSubscription ? '이미 구독 중' : '구독하기'}
              </button>
            </div>
          ))}
        </div>

        {/* Subscription Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">{selectedPlan.name} 플랜 구독</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  결제 주기 선택
                </label>
                <div className="space-y-2">
                  {(['monthly', 'quarterly', 'yearly'] as const).map((cycle) => (
                    <label
                      key={cycle}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                        billingCycle === cycle
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="billing_cycle"
                          value={cycle}
                          checked={billingCycle === cycle}
                          onChange={(e) =>
                            setBillingCycle(e.target.value as 'monthly' | 'quarterly' | 'yearly')
                          }
                          className="mr-3"
                        />
                        <span className="font-medium">{getCycleLabel(cycle)}</span>
                      </div>
                      <span className="text-lg font-bold">
                        {formatPrice(selectedPlan.pricing[cycle])}원
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">플랜:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">결제 주기:</span>
                  <span className="font-medium">{getCycleLabel(billingCycle)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>총 금액:</span>
                  <span className="text-primary">
                    {formatPrice(selectedPlan.pricing[billingCycle])}원
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmSubscription}
                  disabled={createMutation.isPending}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {createMutation.isPending ? '처리 중...' : '구독 시작'}
                </button>
                <button
                  onClick={() => {
                    setSelectedPlan(null)
                    setError('')
                  }}
                  className="flex-1 btn-secondary"
                  disabled={createMutation.isPending}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SubscriptionPlansPage
