import apiClient from '@/api/axios'
import type { Category, Product, CalculationResult, ProductReview, ProductReviewSummary, MyProductReview } from '@/types/calculator'

export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get('/categories')
  return res.data.data
}

export const getProducts = async (params?: {
  categoryId?: number
  brand?: string
  keyword?: string
}): Promise<Product[]> => {
  const res = await apiClient.get('/products', { params })
  return res.data.data
}

export const calculate = async (data: {
  productId?: number
  ratio: number
  waterMl: number
  memo?: string
}): Promise<CalculationResult> => {
  const res = await apiClient.post('/calculator', data)
  return res.data.data
}

export const getHistory = async (): Promise<CalculationResult[]> => {
  const res = await apiClient.get('/calculator/history')
  return res.data.data
}

// ==================== 리뷰 ====================

export const getProductReviews = async (productId: number): Promise<ProductReviewSummary> => {
  const res = await apiClient.get(`/products/${productId}/reviews`)
  return res.data.data
}

export const createProductReview = async (productId: number, rating: number, content: string): Promise<ProductReview> => {
  const res = await apiClient.post(`/products/${productId}/reviews`, { rating, content })
  return res.data.data
}

export const deleteProductReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/products/reviews/${reviewId}`)
}

export const getMyProductReviews = async (): Promise<MyProductReview[]> => {
  const res = await apiClient.get('/products/reviews/my')
  return res.data.data
}
