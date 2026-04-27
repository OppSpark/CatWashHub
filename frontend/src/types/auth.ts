export interface SignupRequest {
  email: string
  password: string
  nickname: string
  agreedTerms: boolean
  agreedPrivacy: boolean
  agreedMarketing: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  nickname: string
  email: string
}
