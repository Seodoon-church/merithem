import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ko: {
    translation: {
      'welcome': 'LUMI+ 플랫폼에 오신 것을 환영합니다',
      'login': '로그인',
      'register': '회원가입',
      'email': '이메일',
      'password': '비밀번호',
      'name': '이름',
      'phone': '전화번호',
    },
  },
  en: {
    translation: {
      'welcome': 'Welcome to LUMI+ Platform',
      'login': 'Login',
      'register': 'Register',
      'email': 'Email',
      'password': 'Password',
      'name': 'Name',
      'phone': 'Phone',
    },
  },
  ja: {
    translation: {
      'welcome': 'LUMI+プラットフォームへようこそ',
      'login': 'ログイン',
      'register': '会員登録',
      'email': 'メール',
      'password': 'パスワード',
      'name': '名前',
      'phone': '電話番号',
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
