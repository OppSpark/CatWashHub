import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { signup } from '@/api/authApi'
import { AUTH_MSGS } from '@/constants/messages'

interface SignupForm {
  email: string
  password: string
  nickname: string
  agreedTerms: boolean
  agreedPrivacy: boolean
  agreedMarketing: boolean
}

const SignupPage = () => {
  const navigate = useNavigate()

  const [m_Form, setM_Form] = useState<SignupForm>({
    email: '',
    password: '',
    nickname: '',
    agreedTerms: false,
    agreedPrivacy: false,
    agreedMarketing: false,
  })
  const [m_ShowPassword, setM_ShowPassword] = useState(false)
  const [m_Error, setM_Error] = useState('')
  const [m_Loading, setM_Loading] = useState(false)

  // ==================== 유효성 검사 ====================
  const validateForm = (): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(m_Form.email)) {
      return AUTH_MSGS.ERROR_EMAIL
    }
    if (m_Form.password.length < 8) {
      return AUTH_MSGS.ERROR_PASSWORD_LENGTH
    }
    if (m_Form.nickname.length < 2 || m_Form.nickname.length > 50) {
      return AUTH_MSGS.ERROR_NICKNAME_LENGTH
    }
    if (!m_Form.agreedTerms || !m_Form.agreedPrivacy) {
      return AUTH_MSGS.ERROR_AGREEMENT
    }
    return ''
  }

  // ==================== 이벤트 핸들러 ====================
  const handleAllAgree = (checked: boolean) => {
    setM_Form(prev => ({
      ...prev,
      agreedTerms: checked,
      agreedPrivacy: checked,
      agreedMarketing: checked,
    }))
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error !== '') {
      setM_Error(error)
      return
    }

    try {
      setM_Loading(true)
      setM_Error('')
      await signup(m_Form)
      alert(AUTH_MSGS.SIGNUP_SUCCESS)
      navigate('/login')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.'
      setM_Error(message)
    } finally {
      setM_Loading(false)
    }
  }

  const isAllAgreed = m_Form.agreedTerms && m_Form.agreedPrivacy && m_Form.agreedMarketing

  return (
    <div className="min-h-dvh bg-white flex flex-col">

      {/* 상단 헤더 */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-[#191F28]"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* 타이틀 */}
      <div className="px-6 pt-4 pb-8">
        <h1 className="text-[26px] font-bold text-[#191F28] leading-tight">
          안녕하세요!<br />
          회원가입을 해주세요
        </h1>
      </div>

      {/* 입력 폼 */}
      <div className="flex-1 px-6 flex flex-col gap-4">

        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-[#6B7684]">이메일</label>
          <input
            type="email"
            value={m_Form.email}
            onChange={e => setM_Form(prev => ({ ...prev, email: e.target.value }))}
            placeholder={AUTH_MSGS.PLACEHOLDER_EMAIL}
            className="w-full px-4 py-4 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition"
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-[#6B7684]">비밀번호</label>
          <div className="relative">
            <input
              type={m_ShowPassword ? 'text' : 'password'}
              value={m_Form.password}
              onChange={e => setM_Form(prev => ({ ...prev, password: e.target.value }))}
              placeholder={AUTH_MSGS.PLACEHOLDER_PASSWORD}
              className="w-full px-4 py-4 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition pr-12"
            />
            <button
              type="button"
              onClick={() => setM_ShowPassword(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ADB5C0]"
            >
              {m_ShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* 닉네임 */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-[#6B7684]">닉네임</label>
          <input
            type="text"
            value={m_Form.nickname}
            onChange={e => setM_Form(prev => ({ ...prev, nickname: e.target.value }))}
            placeholder={AUTH_MSGS.PLACEHOLDER_NICKNAME}
            className="w-full px-4 py-4 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition"
          />
        </div>

        {/* 약관 동의 */}
        <div className="flex flex-col gap-3 mt-2">

          {/* 전체 동의 */}
          <button
            onClick={() => handleAllAgree(!isAllAgreed)}
            className="flex items-center gap-3 py-4 px-4 bg-[#F2F4F6] rounded-xl"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${isAllAgreed ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#ADB5C0]'}`}>
              {isAllAgreed && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-[15px] font-semibold text-[#191F28]">전체 동의</span>
          </button>

          <div className="flex flex-col gap-2 px-1">
            {/* 이용약관 (필수) */}
            <button
              onClick={() => setM_Form(prev => ({ ...prev, agreedTerms: !prev.agreedTerms }))}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${m_Form.agreedTerms ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#ADB5C0]'}`}>
                {m_Form.agreedTerms && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-[14px] text-[#6B7684]">
                이용약관 동의 <span className="text-[#3182F6]">(필수)</span>
              </span>
            </button>

            {/* 개인정보처리방침 (필수) */}
            <button
              onClick={() => setM_Form(prev => ({ ...prev, agreedPrivacy: !prev.agreedPrivacy }))}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${m_Form.agreedPrivacy ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#ADB5C0]'}`}>
                {m_Form.agreedPrivacy && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-[14px] text-[#6B7684]">
                개인정보처리방침 동의 <span className="text-[#3182F6]">(필수)</span>
              </span>
            </button>

            {/* 마케팅 수신 (선택) */}
            <button
              onClick={() => setM_Form(prev => ({ ...prev, agreedMarketing: !prev.agreedMarketing }))}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${m_Form.agreedMarketing ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#ADB5C0]'}`}>
                {m_Form.agreedMarketing && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-[14px] text-[#6B7684]">
                마케팅 수신 동의 <span className="text-[#ADB5C0]">(선택)</span>
              </span>
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {m_Error !== '' && (
          <p className="text-[13px] text-[#F04452] text-center">{m_Error}</p>
        )}
      </div>

      {/* 하단 버튼 영역 */}
      <div className="px-6 py-6 flex flex-col gap-3">
        {/* 회원가입 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={m_Loading}
          className="w-full py-4 bg-[#3182F6] text-white text-[17px] font-semibold rounded-xl disabled:opacity-50 active:bg-[#1B64DA] transition"
        >
          {m_Loading ? '처리 중...' : '회원가입'}
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E5E8EB]" />
          <span className="text-[13px] text-[#ADB5C0]">또는</span>
          <div className="flex-1 h-px bg-[#E5E8EB]" />
        </div>

        {/* 구글 로그인 버튼 */}
        <a
          href="/oauth2/authorization/google"
          className="w-full py-4 bg-white border border-[#E5E8EB] text-[#191F28] text-[17px] font-semibold rounded-xl flex items-center justify-center gap-2 active:bg-[#F2F4F6] transition"
        >
          <GoogleIcon />
          Google로 시작하기
        </a>

        {/* 로그인 링크 */}
        <p className="text-center text-[14px] text-[#6B7684]">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#3182F6] font-semibold"
          >
            로그인
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

export default SignupPage
