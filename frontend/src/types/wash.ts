export type Weather = 'SUNNY' | 'CLOUDY' | 'RAINY' | 'SNOWY'
export type PhotoType = 'BEFORE' | 'AFTER' | 'ETC'

export interface WashPhoto {
  id: number
  photoUrl: string
  photoType: PhotoType
}

export interface WashProductItem {
  id: number
  productId: number | null
  productName: string
  category: string | null
  memo: string | null
  sortOrder: number
}

export interface WashSession {
  id: number
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
  washedAt: string
  location: string | null
  rating: number | null
  cost: number | null
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
  recentSessions: WashSessionSummary[]
  favoriteSets: ProductSetSummary[]
}

// 세차 일지 작성 요청 타입
export interface WashSessionRequest {
  washedAt: string
  location: string | null
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
