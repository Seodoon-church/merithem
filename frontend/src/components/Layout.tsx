import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import LanguageSwitcher from './LanguageSwitcher'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard">
              <h1 className="text-2xl font-bold text-primary">LUMI+</h1>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary">
                {t('dashboard')}
              </Link>
              <Link to="/devices" className="text-gray-700 hover:text-primary">
                {t('devices')}
              </Link>
              <Link to="/diagnoses" className="text-gray-700 hover:text-primary">
                진단 이력
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-primary">
                {t('profile')}
              </Link>
              <LanguageSwitcher />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}

export default Layout
