import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { userService, UpdateProfileData } from '../services/userService'

function ProfilePage() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setMessage('프로필이 성공적으로 업데이트되었습니다.')
      setIsEditing(false)
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const [formData, setFormData] = useState<UpdateProfileData>({})

  useEffect(() => {
    if (data?.data.user) {
      setFormData({
        name: data.data.user.name || '',
        phone: data.data.user.phone || '',
        language: data.data.user.language || 'ko',
        birth_date: data.data.user.birth_date || '',
        gender: data.data.user.gender || '',
        skin_type: data.data.user.skin_type || '',
        bio: data.data.user.bio || '',
        city: data.data.user.city || '',
        country: data.data.user.country || 'KR',
      })
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    )
  }

  const user = data?.data.user

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">프로필</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              프로필 수정
            </button>
          )}
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">기본 정보</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.phone || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    언어
                  </label>
                  {isEditing ? (
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {user?.language === 'ko' ? '한국어' : user?.language === 'en' ? 'English' : '日本語'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    생년월일
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.birth_date || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성별
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">선택 안함</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                      <option value="prefer_not_to_say">응답하지 않음</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {user?.gender === 'male'
                        ? '남성'
                        : user?.gender === 'female'
                        ? '여성'
                        : user?.gender === 'other'
                        ? '기타'
                        : user?.gender === 'prefer_not_to_say'
                        ? '응답하지 않음'
                        : '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skin Info */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">피부 정보</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    피부 타입
                  </label>
                  {isEditing ? (
                    <select
                      name="skin_type"
                      value={formData.skin_type}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">선택 안함</option>
                      <option value="dry">건성</option>
                      <option value="oily">지성</option>
                      <option value="combination">복합성</option>
                      <option value="sensitive">민감성</option>
                      <option value="normal">중성</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {user?.skin_type === 'dry'
                        ? '건성'
                        : user?.skin_type === 'oily'
                        ? '지성'
                        : user?.skin_type === 'combination'
                        ? '복합성'
                        : user?.skin_type === 'sensitive'
                        ? '민감성'
                        : user?.skin_type === 'normal'
                        ? '중성'
                        : '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="간단한 자기소개를 입력하세요"
                />
              ) : (
                <p className="text-gray-900">{user?.bio || '-'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  취소
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage
