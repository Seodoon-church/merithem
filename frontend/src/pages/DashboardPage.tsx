import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { dashboardService } from '../services/dashboardService'

function DashboardPage() {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getStats(),
  })

  const stats = data?.data.stats
  const recentDiagnoses = data?.data.recentDiagnoses || []
  const recentDevices = data?.data.recentDevices || []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard')}</h2>
          <p className="text-gray-600">{t('welcome')}</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12">{t('loading')}</div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{t('registeredDevices')}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.deviceCount || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{t('diagnosisRecords')}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.diagnosisCount || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary-purple/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-secondary-purple"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{t('subscriptionStatus')}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats?.subscription ? stats.subscription.plan_type : t('unsubscribed')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">{t('deviceManagement')}</h3>
                <p className="text-gray-600 mb-6">LUMI+ 디바이스를 등록하고 관리하세요</p>
                <Link to="/devices" className="btn-primary inline-block">
                  {t('registerDevice')}
                </Link>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">{t('skinDiagnosis')}</h3>
                <p className="text-gray-600 mb-6">AI 기반의 정확한 피부 분석을 시작하세요</p>
                <Link to="/diagnoses" className="btn-primary inline-block">
                  {t('startDiagnosis')}
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Diagnoses */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">최근 진단</h3>
                  {recentDiagnoses.length > 0 && (
                    <Link to="/diagnoses" className="text-primary text-sm hover:underline">
                      전체보기
                    </Link>
                  )}
                </div>
                {recentDiagnoses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('noActivity')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDiagnoses.map((diagnosis) => (
                      <Link
                        key={diagnosis.id}
                        to={`/diagnoses/${diagnosis.id}`}
                        className="block p-3 hover:bg-gray-50 rounded-lg transition"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">
                              {new Date(diagnosis.diagnosis_date).toLocaleDateString('ko-KR')}
                            </p>
                            <p className="font-medium">점수: {diagnosis.overall_score || '-'}</p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Devices */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">최근 디바이스</h3>
                  {recentDevices.length > 0 && (
                    <Link to="/devices" className="text-primary text-sm hover:underline">
                      전체보기
                    </Link>
                  )}
                </div>
                {recentDevices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('noDevices')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDevices.map((device) => (
                      <div key={device.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{device.nickname || device.model}</p>
                            <p className="text-sm text-gray-600">{device.serial_number}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              device.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {device.status === 'active' ? t('active') : t('inactive')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default DashboardPage
