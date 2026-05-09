import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { login } from '@/api/authApi'
import { AUTH_MSGS } from '@/constants/messages'
import { useValidation } from '@/hooks/useValidation'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'
import FieldInput from '@/components/FieldInput'

const LoginPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const setAuth = useAuthStore(s => s.setAuth)
  const { validateEmail } = useValidation()

  const [m_Email, setM_Email] = useState('')
  const [m_Password, setM_Password] = useState('')
  const [m_Loading, setM_Loading] = useState(false)
  const [m_Shake, setM_Shake] = useState(false)

  const emailError = validateEmail(m_Email)

  const triggerShake = () => {
    setM_Shake(true)
    setTimeout(() => setM_Shake(false), 400)
  }

  const handleSubmit = async () => {
    if (emailError.valid !== true) {
      toast.error(emailError.message || AUTH_MSGS.ERROR_EMAIL)
      triggerShake()
      return
    }
    if (m_Password === '') {
      toast.error('비밀번호를 입력해주세요.')
      triggerShake()
      return
    }

    try {
      setM_Loading(true)
      const res = await login(m_Email, m_Password)
      setAuth(res.accessToken, res.nickname, res.email)
      toast.success(`${res.nickname}님, 환영합니다!`)
      navigate('/home')
    } catch {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다.')
      triggerShake()
    } finally {
      setM_Loading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleSubmit() }
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">

      {/* 헤더 */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#191F28]">
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* 타이틀 */}
      <div className="px-6 pt-4 pb-8">
        <h1 className="text-[26px] font-bold text-[#191F28] leading-tight">
          다시 만나서 반가워요!<br />로그인 해주세요
        </h1>
      </div>

      {/* 입력 폼 */}
      <div className={`flex-1 px-6 flex flex-col gap-4 ${m_Shake ? 'animate-shake' : ''}`}>
        <FieldInput
          label="이메일"
          type="email"
          value={m_Email}
          onChange={setM_Email}
          placeholder={AUTH_MSGS.PLACEHOLDER_EMAIL}
          fieldError={emailError}
          showSuccessMessage={false}
        />
        <div onKeyDown={handleKeyDown}>
          <FieldInput
            label="비밀번호"
            value={m_Password}
            onChange={setM_Password}
            placeholder={AUTH_MSGS.PLACEHOLDER_PASSWORD}
            showToggle
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 py-6 flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={m_Loading}
          className="w-full py-4 bg-[#3182F6] text-white text-[17px] font-semibold rounded-xl disabled:opacity-50 active:bg-[#1B64DA] transition"
        >
          {m_Loading ? '로그인 중...' : '로그인'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E5E8EB]" />
          <span className="text-[13px] text-[#ADB5C0]">또는</span>
          <div className="flex-1 h-px bg-[#E5E8EB]" />
        </div>

        <a
          href="/oauth2/authorization/google"
          className="w-full py-4 bg-white border border-[#E5E8EB] text-[#191F28] text-[17px] font-semibold rounded-xl flex items-center justify-center gap-2 active:bg-[#F2F4F6] transition"
        >
          <GoogleIcon />
          Google로 시작하기
        </a>

        <p className="text-center text-[14px] text-[#6B7684]">
          아직 계정이 없으신가요?{' '}
          <button onClick={() => navigate('/signup')} className="text-[#3182F6] font-semibold">
            회원가입
          </button>
        </p>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default LoginPage
