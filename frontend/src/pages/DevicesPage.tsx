import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { deviceService, RegisterDeviceData } from '../services/deviceService'

function DevicesPage() {
  const queryClient = useQueryClient()
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [formData, setFormData] = useState<RegisterDeviceData>({
    serial_number: '',
    model: '',
    nickname: '',
  })
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getDevices(),
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDeviceData) => deviceService.registerDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      setShowRegisterModal(false)
      setFormData({ serial_number: '', model: '', nickname: '' })
      setMessage('디바이스가 성공적으로 등록되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deviceService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      setMessage('디바이스가 삭제되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const syncMutation = useMutation({
    mutationFn: (id: string) => deviceService.syncDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      setMessage('디바이스가 동기화되었습니다.')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate(formData)
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 이 디바이스를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSync = (id: string) => {
    syncMutation.mutate(id)
  }

  const devices = data?.data.devices || []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">내 디바이스</h2>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary"
          >
            + 디바이스 등록
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : devices.length === 0 ? (
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
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <p className="text-gray-500 mb-4">등록된 디바이스가 없습니다</p>
            <button onClick={() => setShowRegisterModal(true)} className="btn-primary">
              디바이스 등록하기
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {device.nickname || device.model}
                    </h3>
                    <p className="text-sm text-gray-500">{device.model}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      device.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : device.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : device.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {device.status === 'active'
                      ? '활성'
                      : device.status === 'inactive'
                      ? '비활성'
                      : device.status === 'maintenance'
                      ? '점검중'
                      : '폐기'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">시리얼 번호:</span>
                    <span className="text-gray-900 font-medium">{device.serial_number}</span>
                  </div>
                  {device.firmware_version && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">펌웨어:</span>
                      <span className="text-gray-900">{device.firmware_version}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">등록일:</span>
                    <span className="text-gray-900">
                      {new Date(device.registered_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {device.last_sync_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">마지막 동기화:</span>
                      <span className="text-gray-900">
                        {new Date(device.last_sync_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(device.id)}
                    disabled={syncMutation.isPending}
                    className="flex-1 btn-secondary text-sm"
                  >
                    동기화
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
                    disabled={deleteMutation.isPending}
                    className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Register Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">디바이스 등록</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시리얼 번호 *
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData({ ...formData, serial_number: e.target.value })
                    }
                    className="input-field"
                    placeholder="LUMI-XXXX-XXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    모델명 *
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="LUMI+ Pro">LUMI+ Pro</option>
                    <option value="LUMI+ Basic">LUMI+ Basic</option>
                    <option value="LUMI+ Mini">LUMI+ Mini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    별칭 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input-field"
                    placeholder="예: 내 방 디바이스"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {registerMutation.isPending ? '등록 중...' : '등록'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default DevicesPage
