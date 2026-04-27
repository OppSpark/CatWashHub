import axios from 'axios'
import type { Category, Product, CalculationResult } from '@/types/calculator'

const api = axios.create({
  baseURL: '/api',
})

// 요청마다 토큰 자동 첨부
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories')
  return res.data.data
}

export const getProducts = async (params?: {
  categoryId?: number
  brand?: string
  keyword?: string
}): Promise<Product[]> => {
  const res = await api.get('/products', { params })
  return res.data.data
}

export const calculate = async (data: {
  productId?: number
  ratio: number
  waterMl: number
  memo?: string
}): Promise<CalculationResult> => {
  const res = await api.post('/calculator', data)
  return res.data.data
}

export const getHistory = async (): Promise<CalculationResult[]> => {
  const res = await api.get('/calculator/history')
  return res.data.data
}
