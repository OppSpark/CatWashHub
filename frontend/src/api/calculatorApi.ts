import apiClient from '@/api/axios'
import type { Category, Product, CalculationResult } from '@/types/calculator'

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
