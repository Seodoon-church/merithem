import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { diagnosisService } from '../services/diagnosisService'

function DiagnosisDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery({
    queryKey: ['diagnosis', id],
    queryFn: () => diagnosisService.getDiagnosis(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">{t('loading')}</div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600">진단 기록을 불러올 수 없습니다.</p>
          <Link to="/diagnoses" className="btn-primary mt-4 inline-block">
            목록으로 돌아가기
          </Link>
        </div>
      </Layout>
    )
  }

  const diagnosis = data.data.diagnosis

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score?: number) => {
    if (!score) return '데이터 없음'
    if (score >= 80) return '좋음'
    if (score >= 60) return '보통'
    return '주의 필요'
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-primary hover:underline mb-4">
            ← 뒤로가기
          </button>
          <h2 className="text-3xl font-bold text-gray-900">피부 진단 상세</h2>
          <p className="text-gray-600 mt-2">
            {new Date(diagnosis.diagnosis_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Overall Score */}
        {diagnosis.overall_score && (
          <div className="card mb-6 text-center">
            <p className="text-gray-600 mb-2">종합 피부 점수</p>
            <p className={`text-6xl font-bold ${getScoreColor(diagnosis.overall_score)}`}>
              {diagnosis.overall_score}
            </p>
            <p className="text-lg text-gray-600 mt-2">{getScoreLabel(diagnosis.overall_score)}</p>
          </div>
        )}

        {/* Device Info */}
        {diagnosis.device_serial_number && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-3">사용 디바이스</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">모델:</span>
                <span className="font-medium">{diagnosis.device_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">시리얼 번호:</span>
                <span className="font-medium">{diagnosis.device_serial_number}</span>
              </div>
              {diagnosis.device_nickname && (
                <div className="flex justify-between">
                  <span className="text-gray-600">별칭:</span>
                  <span className="font-medium">{diagnosis.device_nickname}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Scores */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-4">상세 분석 결과</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: '수분도', value: diagnosis.moisture_level, icon: '💧' },
              { label: '탄력도', value: diagnosis.elasticity_level, icon: '✨' },
              { label: '주름 정도', value: diagnosis.wrinkle_severity, icon: '📏' },
              { label: '모공 크기', value: diagnosis.pore_size, icon: '🔍' },
              { label: '색소 침착', value: diagnosis.pigmentation_level, icon: '🎨' },
              { label: '붉은기', value: diagnosis.redness_level, icon: '🔴' },
              { label: '여드름 정도', value: diagnosis.acne_severity, icon: '⚠️' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {item.icon} {item.label}
                  </span>
                  {item.value !== null && item.value !== undefined && (
                    <span className={`text-xl font-bold ${getScoreColor(item.value)}`}>
                      {item.value}
                    </span>
                  )}
                </div>
                {item.value !== null && item.value !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.value >= 80
                          ? 'bg-green-500'
                          : item.value >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detected Issues */}
        {diagnosis.detected_issues && diagnosis.detected_issues.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-4">감지된 피부 문제</h3>
            <div className="flex flex-wrap gap-2">
              {diagnosis.detected_issues.map((issue, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {diagnosis.recommendations && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-4">추천 케어</h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {JSON.stringify(diagnosis.recommendations, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Notes */}
        {diagnosis.notes && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-4">메모</h3>
            <p className="text-gray-700">{diagnosis.notes}</p>
          </div>
        )}

        {/* Skin Tone */}
        {diagnosis.skin_tone && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-4">피부 톤</h3>
            <p className="text-gray-700">{diagnosis.skin_tone}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link to="/diagnoses" className="btn-secondary flex-1 text-center">
            목록으로
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default DiagnosisDetailPage
