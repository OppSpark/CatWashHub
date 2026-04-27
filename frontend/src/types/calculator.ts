export interface Category {
  id: number
  name: string
  sortOrder: number
}

export interface DilutionRatio {
  id: number
  label: string
  ratio: number
  description: string
}

export interface Product {
  id: number
  categoryName: string | null
  name: string
  brand: string | null
  description: string | null
  price: number | null
  capacityMl: number | null
  imageUrl: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  dilutionRatios: DilutionRatio[]
  isOfficial: boolean  // user_id가 null이면 관리자 등록 (공식 제품)
}

export interface CalculationResult {
  productId: number | null
  productName: string
  ratio: number
  waterMl: number
  productMl: number
  memo: string | null
}
