import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { aiService, AnalysisResult } from '../services/aiService'
import { deviceService } from '../services/deviceService'

function SkinAnalysisPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Fetch user's devices
  const { data: devicesData } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getDevices(),
  })

  const devices = devicesData?.data.devices || []

  // Mutation for analyzing skin
  const analyzeMutation = useMutation({
    mutationFn: ({ file, deviceId }: { file: File; deviceId: string }) =>
      aiService.analyzeSkin(file, deviceId),
    onSuccess: (response) => {
      setAnalysisResult(response.data.analysis)
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage('피부 분석이 완료되었습니다!')
      setTimeout(() => {
        navigate('/diagnoses')
      }, 2000)
    },
    onError: (err: any) => {
      setError(err.message || '분석 중 오류가 발생했습니다.')
    },
  })

  // Mutation for quick scan
  const quickScanMutation = useMutation({
    mutationFn: (file: File) => aiService.quickScan(file),
    onSuccess: (response) => {
      setAnalysisResult(response.data)
      setMessage('빠른 스캔이 완료되었습니다!')
    },
    onError: (err: any) => {
      setError(err.message || '스캔 중 오류가 발생했습니다.')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.')
        return
      }

      setSelectedFile(file)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError('이미지를 선택해주세요.')
      return
    }

    if (!selectedDevice) {
      setError('디바이스를 선택해주세요.')
      return
    }

    analyzeMutation.mutate({ file: selectedFile, deviceId: selectedDevice })
  }

  const handleQuickScan = () => {
    if (!selectedFile) {
      setError('이미지를 선택해주세요.')
      return
    }

    quickScanMutation.mutate(selectedFile)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getRecommendationMessage = (rec: any) => {
    const lang = i18n.language
    if (lang === 'en') return rec.message_en
    if (lang === 'ja') return rec.message_ja
    return rec.message
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">AI 피부 분석</h2>
          <p className="text-gray-600 mt-2">피부 이미지를 업로드하여 AI 분석을 받으세요</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">이미지 업로드</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피부 이미지 선택
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, WEBP 형식 지원 (최대 10MB)
              </p>
            </div>

            {previewUrl && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                디바이스 선택 (전체 분석용)
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">디바이스를 선택하세요</option>
                {devices.map((device: any) => (
                  <option key={device.id} value={device.id}>
                    {device.device_name} ({device.serial_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !selectedFile || !selectedDevice}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {analyzeMutation.isPending ? '분석 중...' : '전체 분석 (저장)'}
              </button>
              <button
                onClick={handleQuickScan}
                disabled={quickScanMutation.isPending || !selectedFile}
                className="flex-1 btn-secondary disabled:opacity-50"
              >
                {quickScanMutation.isPending ? '스캔 중...' : '빠른 스캔'}
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              전체 분석: 결과를 저장하고 진단 이력에 추가합니다.
              <br />
              빠른 스캔: 즉시 결과를 확인하며 저장하지 않습니다.
            </p>
          </div>

          {/* Results Section */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">분석 결과</h3>

            {!analysisResult ? (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>분석 결과가 여기에 표시됩니다</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">종합 점수</span>
                    <span className={`text-2xl font-bold ${getScoreColor(analysisResult.overall_score)}`}>
                      {analysisResult.overall_score}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getScoreBgColor(analysisResult.overall_score)}`}
                      style={{ width: `${analysisResult.overall_score}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {Object.entries(analysisResult.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 capitalize">{key}</span>
                        <span className={`font-medium ${getScoreColor(value)}`}>{value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBgColor(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">추천 사항</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                          <svg
                            className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{getRecommendationMessage(rec)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.face_detected && (
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    얼굴이 감지되었습니다
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SkinAnalysisPage
