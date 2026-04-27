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
}

export interface CalculationResult {
  productId: number | null
  productName: string
  ratio: number
  waterMl: number
  productMl: number
}
