import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { diagnosisService } from '../services/diagnosisService'

function DiagnosesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: () => diagnosisService.getDiagnoses(50, 0),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => diagnosisService.deleteDiagnosis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage('진단 기록이 삭제되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('정말 이 진단 기록을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const diagnoses = data?.data.diagnoses || []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">피부 진단 이력</h2>
            <p className="text-gray-600 mt-2">AI 기반 피부 분석 결과를 확인하세요</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">{t('loading')}</div>
        ) : diagnoses.length === 0 ? (
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-500 mb-4">아직 진단 기록이 없습니다</p>
            <p className="text-sm text-gray-400">
              LUMI+ 디바이스로 피부 진단을 시작해보세요
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="card hover:shadow-md transition">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        {new Date(diagnosis.diagnosis_date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {diagnosis.device_serial_number && (
                        <p className="text-xs text-gray-400 mt-1">
                          {diagnosis.device_model} ({diagnosis.device_serial_number})
                        </p>
                      )}
                    </div>
                    {diagnosis.overall_score && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">종합 점수</p>
                        <p className={`text-2xl font-bold ${getScoreColor(diagnosis.overall_score)}`}>
                          {diagnosis.overall_score}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {diagnosis.moisture_level !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">수분도:</span>
                      <span className="font-medium">{diagnosis.moisture_level}</span>
                    </div>
                  )}
                  {diagnosis.elasticity_level !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">탄력도:</span>
                      <span className="font-medium">{diagnosis.elasticity_level}</span>
                    </div>
                  )}
                  {diagnosis.wrinkle_severity !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">주름 정도:</span>
                      <span className="font-medium">{diagnosis.wrinkle_severity}</span>
                    </div>
                  )}
                  {diagnosis.pore_size !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">모공 크기:</span>
                      <span className="font-medium">{diagnosis.pore_size}</span>
                    </div>
                  )}
                </div>

                {diagnosis.detected_issues && diagnosis.detected_issues.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">감지된 문제:</p>
                    <div className="flex flex-wrap gap-1">
                      {diagnosis.detected_issues.slice(0, 3).map((issue, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded"
                        >
                          {issue}
                        </span>
                      ))}
                      {diagnosis.detected_issues.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{diagnosis.detected_issues.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/diagnoses/${diagnosis.id}`}
                    className="flex-1 btn-secondary text-sm text-center"
                  >
                    상세보기
                  </Link>
                  <button
                    onClick={() => handleDelete(diagnosis.id)}
                    disabled={deleteMutation.isPending}
                    className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {diagnoses.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            총 {data?.data.total || 0}개의 진단 기록
          </div>
        )}
      </div>
    </Layout>
  )
}

export default DiagnosesPage
