import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { signup } from '@/api/authApi'
import { AUTH_MSGS } from '@/constants/messages'
import { useValidation } from '@/hooks/useValidation'
import { useToast } from '@/hooks/useToast'
import FieldInput from '@/components/FieldInput'

const SignupPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { validateEmail, validatePassword, validatePasswordConfirm, validateNickname } = useValidation()

  const [m_Email, setM_Email] = useState('')
  const [m_Password, setM_Password] = useState('')
  const [m_PasswordConfirm, setM_PasswordConfirm] = useState('')
  const [m_Nickname, setM_Nickname] = useState('')
  const [m_AgreedTerms, setM_AgreedTerms] = useState(false)
  const [m_AgreedPrivacy, setM_AgreedPrivacy] = useState(false)
  const [m_AgreedMarketing, setM_AgreedMarketing] = useState(false)
  const [m_Loading, setM_Loading] = useState(false)
  const [m_Shake, setM_Shake] = useState(false)

  // 실시간 유효성
  const emailError = validateEmail(m_Email)
  const passwordError = validatePassword(m_Password)
  const passwordConfirmError = validatePasswordConfirm(m_Password, m_PasswordConfirm)
  const nicknameError = validateNickname(m_Nickname)

  const isAllAgreed = m_AgreedTerms && m_AgreedPrivacy && m_AgreedMarketing

  const handleAllAgree = (checked: boolean) => {
    setM_AgreedTerms(checked)
    setM_AgreedPrivacy(checked)
    setM_AgreedMarketing(checked)
  }

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
    if (passwordError.valid !== true) {
      toast.error(passwordError.message || AUTH_MSGS.ERROR_PASSWORD_LENGTH)
      triggerShake()
      return
    }
    if (passwordConfirmError.valid !== true) {
      toast.error('비밀번호가 일치하지 않습니다.')
      triggerShake()
      return
    }
    if (nicknameError.valid !== true) {
      toast.error(nicknameError.message || AUTH_MSGS.ERROR_NICKNAME_LENGTH)
      triggerShake()
      return
    }
    if (!m_AgreedTerms || !m_AgreedPrivacy) {
      toast.error(AUTH_MSGS.ERROR_AGREEMENT)
      triggerShake()
      return
    }

    try {
      setM_Loading(true)
      await signup({
        email: m_Email,
        password: m_Password,
        nickname: m_Nickname,
        agreedTerms: m_AgreedTerms,
        agreedPrivacy: m_AgreedPrivacy,
        agreedMarketing: m_AgreedMarketing,
      })
      toast.success(AUTH_MSGS.SIGNUP_SUCCESS)
      navigate('/login')
    } catch {
      toast.error('이미 사용 중인 이메일 또는 닉네임입니다.')
      triggerShake()
    } finally {
      setM_Loading(false)
    }
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
          안녕하세요!<br />회원가입을 해주세요
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
        />
        <FieldInput
          label="비밀번호"
          value={m_Password}
          onChange={setM_Password}
          placeholder="8자 이상, 특수문자 포함"
          fieldError={passwordError}
          showToggle
        />
        <FieldInput
          label="비밀번호 확인"
          value={m_PasswordConfirm}
          onChange={setM_PasswordConfirm}
          placeholder="비밀번호를 한 번 더 입력해주세요"
          fieldError={passwordConfirmError}
          showToggle
        />
        <FieldInput
          label="닉네임"
          value={m_Nickname}
          onChange={setM_Nickname}
          placeholder="2~20자, 한글/영문/숫자/_"
          fieldError={nicknameError}
        />

        {/* 약관 동의 */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => handleAllAgree(!isAllAgreed)}
            className="flex items-center gap-3 py-4 px-4 bg-[#F2F4F6] rounded-xl"
          >
            <AgreeDot checked={isAllAgreed} />
            <span className="text-[15px] font-semibold text-[#191F28]">전체 동의</span>
          </button>
          <div className="flex flex-col gap-3 px-1">
            <AgreeRow
              checked={m_AgreedTerms}
              label="이용약관 동의"
              required
              onChange={() => setM_AgreedTerms(p => !p)}
            />
            <AgreeRow
              checked={m_AgreedPrivacy}
              label="개인정보처리방침 동의"
              required
              onChange={() => setM_AgreedPrivacy(p => !p)}
            />
            <AgreeRow
              checked={m_AgreedMarketing}
              label="마케팅 수신 동의"
              required={false}
              onChange={() => setM_AgreedMarketing(p => !p)}
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 py-6 flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={m_Loading}
          className="w-full py-4 bg-[#3182F6] text-white text-[17px] font-semibold rounded-xl disabled:opacity-50 active:bg-[#1B64DA] transition"
        >
          {m_Loading ? '처리 중...' : '회원가입'}
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
          이미 계정이 있으신가요?{' '}
          <button onClick={() => navigate('/login')} className="text-[#3182F6] font-semibold">
            로그인
          </button>
        </p>
      </div>
    </div>
  )
}

// ==================== 내부 컴포넌트 ====================
const AgreeDot = ({ checked }: { checked: boolean }) => (
  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${checked ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#ADB5C0]'}`}>
    {checked && <div className="w-2 h-2 bg-white rounded-full" />}
  </div>
)

interface AgreeRowProps {
  checked: boolean
  label: string
  required: boolean
  onChange: () => void
}

const AgreeRow = ({ checked, label, required, onChange }: AgreeRowProps) => (
  <button onClick={onChange} className="flex items-center gap-3">
    <AgreeDot checked={checked} />
    <span className="text-[14px] text-[#6B7684]">
      {label}{' '}
      <span className={required ? 'text-[#3182F6]' : 'text-[#ADB5C0]'}>
        ({required ? '필수' : '선택'})
      </span>
    </span>
  </button>
)

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default SignupPage
