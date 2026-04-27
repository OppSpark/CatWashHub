export interface FieldError {
  message: string
  valid: boolean | null  // null = 미입력 상태
}

const c_EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const c_SpecialCharRegex = /[!@#$%^&*(),.?":{}|<>]/
const c_NicknameRegex = /^[가-힣a-zA-Z0-9_]+$/

export const useValidation = () => {

  const validateEmail = (value: string): FieldError => {
    if (value === '') { return { message: '', valid: null } }
    if (!c_EmailRegex.test(value)) {
      return { message: '올바른 이메일 형식이 아닙니다.', valid: false }
    }
    return { message: '사용 가능한 이메일입니다.', valid: true }
  }

  const validatePassword = (value: string): FieldError => {
    if (value === '') { return { message: '', valid: null } }
    if (value.length < 8) {
      return { message: '비밀번호는 8자 이상이어야 합니다.', valid: false }
    }
    if (!c_SpecialCharRegex.test(value)) {
      return { message: '특수문자를 1개 이상 포함해야 합니다.', valid: false }
    }
    return { message: '사용 가능한 비밀번호입니다.', valid: true }
  }

  const validatePasswordConfirm = (password: string, confirm: string): FieldError => {
    if (confirm === '') { return { message: '', valid: null } }
    if (password !== confirm) {
      return { message: '비밀번호가 일치하지 않습니다.', valid: false }
    }
    return { message: '비밀번호가 일치합니다.', valid: true }
  }

  const validateNickname = (value: string): FieldError => {
    if (value === '') { return { message: '', valid: null } }
    if (value.length < 2) {
      return { message: '닉네임은 2자 이상이어야 합니다.', valid: false }
    }
    if (value.length > 20) {
      return { message: '닉네임은 20자 이하여야 합니다.', valid: false }
    }
    if (!c_NicknameRegex.test(value)) {
      return { message: '한글, 영문, 숫자, _만 사용 가능합니다.', valid: false }
    }
    return { message: '사용 가능한 닉네임입니다.', valid: true }
  }

  return { validateEmail, validatePassword, validatePasswordConfirm, validateNickname }
}
