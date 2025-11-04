import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'

function HomePage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: 'AI 피부 진단',
      description: '인공지능 기반의 정확한 피부 분석과 7가지 지표 측정',
      color: 'bg-purple-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'LUMI+ 디바이스',
      description: '의료기기급 5-in-1 멀티 에너지 홈케어 솔루션',
      color: 'bg-blue-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: '맞춤형 케어',
      description: '개인별 피부 상태에 최적화된 제품 추천 및 관리',
      color: 'bg-green-500',
    },
  ]

  const stats = [
    { value: '3M+', label: '글로벌 공급' },
    { value: '20+', label: '수출 국가' },
    { value: '25년', label: '제조 경험' },
    { value: '49건', label: '특허 & 인증' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L+</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                LUMI+
              </h1>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to="/login" className="btn-ghost text-sm">
                {t('login')}
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-60"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-full text-sm font-medium mb-8 shadow-soft">
              <span className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Smart Beauty, Real Science
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              당신의 피부에
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent">
                과학을 입히다
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              의료기기급 기술로 개발된 LUMI+ 5-in-1 디바이스와<br className="hidden sm:block" />
              AI 피부 진단으로 전문가급 홈케어 솔루션을 경험하세요
            </p>

            <div className="flex gap-4 justify-center flex-wrap mb-16">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                무료로 시작하기 →
              </Link>
              <a href="#features" className="btn-secondary text-base px-8 py-4">
                더 알아보기
              </a>
            </div>

            {/* Hero Image with modern design */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <div className="relative aspect-video bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-medium">LUMI+ 플랫폼 프리뷰</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-card border border-gray-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="section-header">
          <h3 className="section-title">핵심 서비스</h3>
          <p className="section-subtitle">
            LUMI+ 플랫폼의 핵심 기능을 경험해보세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-hover cursor-pointer"
            >
              {/* 배경 그라데이션 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

              <div className="relative">
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-soft`}
                >
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                {/* 화살표 아이콘 */}
                <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">자세히 보기</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-header">
            <h3 className="section-title">어떻게 작동하나요?</h3>
            <p className="section-subtitle">간단한 3단계로 시작하세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: 1,
                title: '디바이스 등록',
                description: 'LUMI+ 디바이스를 계정에 등록하세요',
                icon: '📱',
              },
              {
                step: 2,
                title: 'AI 진단 받기',
                description: '피부 사진을 촬영하여 AI 분석을 받으세요',
                icon: '🤖',
              },
              {
                step: 3,
                title: '맞춤 케어',
                description: 'AI 추천에 따라 제품을 구매하고 사용하세요',
                icon: '✨',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                {/* 연결선 (마지막 아이템 제외) */}
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-secondary opacity-30 z-0"></div>
                )}

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl text-3xl font-bold mx-auto mb-6 shadow-card group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <span className="text-4xl">{item.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-white opacity-80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary via-primary-600 to-secondary rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-12 lg:p-16 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span>지금 바로 시작하세요</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                당신의 피부 여정,
                <br />
                오늘부터 시작하세요
              </h3>

              <p className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                AI 기반 피부 진단과 의료기기급 LUMI+ 디바이스로<br className="hidden sm:block" />
                전문가급 홈케어를 경험해보세요
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  to="/register"
                  className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  무료 회원가입 →
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  로그인
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* 회사 정보 */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L+</span>
                </div>
                <h3 className="text-2xl font-bold">LUMI+</h3>
              </Link>
              <p className="text-gray-400 mb-6 text-sm">
                Smart Beauty, Real Science
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong className="text-white">메리템 주식회사 (Merithem Inc.)</strong></p>
                <p>PSI Co., Ltd. 전략적 관계사</p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ceo@merithem.com
                </p>
                <p className="pt-2 text-gray-500">
                  글로벌 뷰티 디바이스 전문 기업<br />
                  전 세계 300만대 공급 · 20개국 이상 수출
                </p>
              </div>
            </div>

            {/* 링크 섹션 */}
            <div>
              <h4 className="font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-primary transition">주요 기능</a></li>
                <li><a href="#" className="hover:text-primary transition">LUMI+ 디바이스</a></li>
                <li><a href="#" className="hover:text-primary transition">AI 피부 진단</a></li>
                <li><a href="#" className="hover:text-primary transition">제품 카탈로그</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">지원</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary transition">고객센터</a></li>
                <li><a href="#" className="hover:text-primary transition">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition">이용약관</a></li>
                <li><a href="#" className="hover:text-primary transition">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>

          {/* 하단 바 */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2025 Merithem Inc. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <span className="text-xl">📺</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
