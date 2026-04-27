import { useState } from 'react'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import type { FieldError } from '@/hooks/useValidation'

interface FieldInputProps {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  fieldError?: FieldError
  showToggle?: boolean  // 비밀번호 보이기/숨기기
}

const FieldInput = ({
  label, type = 'text', value, onChange,
  placeholder, fieldError, showToggle = false,
}: FieldInputProps) => {
  const [m_ShowPassword, setM_ShowPassword] = useState(false)

  const inputType = showToggle ? (m_ShowPassword ? 'text' : 'password') : type

  const borderClass =
    fieldError?.valid === true  ? 'ring-2 ring-[#1EC76B]' :
    fieldError?.valid === false ? 'ring-2 ring-[#F04452]' :
                                  'focus:ring-2 focus:ring-[#3182F6]'

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] font-medium text-[#6B7684]">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-4 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none transition ${borderClass} ${showToggle ? 'pr-12' : ''}`}
        />
        {/* 비밀번호 토글 버튼 */}
        {showToggle && (
          <button
            type="button"
            onClick={() => setM_ShowPassword(p => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ADB5C0]"
          >
            {m_ShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        {/* 유효성 아이콘 (비밀번호 토글 없을 때만) */}
        {!showToggle && fieldError?.valid !== null && fieldError?.valid !== undefined && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {fieldError.valid
              ? <CheckCircle size={18} className="text-[#1EC76B]" />
              : <XCircle size={18} className="text-[#F04452]" />
            }
          </div>
        )}
      </div>
      {/* 유효성 메시지 */}
      {fieldError?.valid !== null && fieldError?.message && (
        <p className={`text-[12px] px-1 ${fieldError.valid ? 'text-[#1EC76B]' : 'text-[#F04452]'}`}>
          {fieldError.message}
        </p>
      )}
    </div>
  )
}

export default FieldInput
