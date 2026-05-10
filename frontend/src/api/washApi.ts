import apiClient from '@/api/axios'
import type {
  WashDashboard,
  WashSession,
  WashSessionRequest,
  WashUpdateRequest,
  WashCompleteRequest,
  MonthlyStats,
  ProductSet,
  ProductSetRequest,
} from '@/types/wash'

// ==================== 대시보드 ====================

export const getDashboard = async (): Promise<WashDashboard> => {
  const res = await apiClient.get('/wash/dashboard')
  return res.data.data
}

// ==================== 세차 일지 ====================

export const getSessions = async (): Promise<WashSession[]> => {
  const res = await apiClient.get('/wash')
  return res.data.data
}

export const getSession = async (id: number): Promise<WashSession> => {
  const res = await apiClient.get(`/wash/${id}`)
  return res.data.data
}

// 세차 준비 저장 (PREPARING)
export const createSession = async (data: WashSessionRequest): Promise<WashSession> => {
  const res = await apiClient.post('/wash', data)
  return res.data.data
}

// 세차 준비 수정 (용품/장소 수정)
export const updatePreparation = async (id: number, data: WashSessionRequest): Promise<WashSession> => {
  const res = await apiClient.put(`/wash/${id}/preparation`, data)
  return res.data.data
}

// 완료된 세차 수정
export const updateSession = async (id: number, data: WashUpdateRequest): Promise<WashSession> => {
  const res = await apiClient.patch(`/wash/${id}`, data)
  return res.data.data
}

// 후기 작성 완료 (DONE)
export const completeSession = async (id: number, data: WashCompleteRequest): Promise<WashSession> => {
  const res = await apiClient.patch(`/wash/${id}/complete`, data)
  return res.data.data
}

export const deleteSession = async (id: number): Promise<void> => {
  await apiClient.delete(`/wash/${id}`)
}

export const getMonthlyStats = async (): Promise<MonthlyStats> => {
  const res = await apiClient.get('/wash/stats/monthly')
  return res.data.data
}

// ==================== 용품 세트 ====================

export const getProductSets = async (): Promise<ProductSet[]> => {
  const res = await apiClient.get('/product-sets')
  return res.data.data
}

export const getProductSet = async (id: number): Promise<ProductSet> => {
  const res = await apiClient.get(`/product-sets/${id}`)
  return res.data.data
}

export const createProductSet = async (data: ProductSetRequest): Promise<ProductSet> => {
  const res = await apiClient.post('/product-sets', data)
  return res.data.data
}

export const updateProductSet = async (id: number, data: ProductSetRequest): Promise<ProductSet> => {
  const res = await apiClient.put(`/product-sets/${id}`, data)
  return res.data.data
}

export const deleteProductSet = async (id: number): Promise<void> => {
  await apiClient.delete(`/product-sets/${id}`)
}
