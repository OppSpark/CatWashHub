export type WashStatus = 'PREPARING' | 'DONE'
export type Weather = 'SUNNY' | 'CLOUDY' | 'RAINY' | 'SNOWY'
export type PhotoType = 'BEFORE' | 'AFTER' | 'ETC'

export interface WashPhoto {
  id: number
  photoUrl: string
  photoType: PhotoType
}

export interface DilutionRatio {
  id: number
  label: string
  ratio: number
  description: string | null
}

export interface WashProductItem {
  id: number
  productId: number | null
  productName: string
  category: string | null
  memo: string | null
  sortOrder: number
  dilutionRatios: DilutionRatio[]
}

export interface WashSession {
  id: number
  status: WashStatus
  washedAt: string
  location: string | null
  weather: Weather | null
  durationMinutes: number | null
  cost: number | null
  rating: number | null
  memo: string | null
  photos: WashPhoto[]
  products: WashProductItem[]
  createdAt: string
}

export interface WashSessionSummary {
  id: number
  status: WashStatus
  washedAt: string
  location: string | null
  rating: number | null
  cost: number | null
  productCount: number
}

export interface ProductSetItem {
  id: number
  productId: number | null
  productName: string
  category: string | null
  sortOrder: number
}

export interface ProductSet {
  id: number
  name: string
  isDefault: boolean
  items: ProductSetItem[]
}

export interface ProductSetSummary {
  id: number
  name: string
  isDefault: boolean
  itemCount: number
}

export interface WashDashboard {
  totalCount: number
  lastWashedAt: string | null
  preparingSessions: WashSessionSummary[]   // 진행 중 (PREPARING)
  recentSessions: WashSessionSummary[]      // 최근 완료 (DONE)
  favoriteSets: ProductSetSummary[]
}

// 세차 준비 저장 요청 (1차 - PREPARING)
export interface WashSessionRequest {
  washedAt: string | null
  location: string | null
  products: WashProductRequest[]
}

// 후기 작성 완료 요청 (DONE)
export interface WashCompleteRequest {
  weather: Weather | null
  durationMinutes: number | null
  cost: number | null
  rating: number | null
  memo: string | null
  products: WashProductRequest[]
}

export interface WashProductRequest {
  productId: number | null
  customName: string | null
  category: string | null
  memo: string | null
  sortOrder: number
}

// 용품 세트 요청 타입
export interface ProductSetRequest {
  name: string
  isDefault: boolean
  items: ProductSetItemRequest[]
}

export interface ProductSetItemRequest {
  productId: number | null
  customName: string | null
  category: string | null
  sortOrder: number
}
