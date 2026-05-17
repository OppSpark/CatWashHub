import apiClient from '@/api/axios'
import type {
  Gathering,
  GatheringSummary,
  GatheringRequest,
  GatheringParticipantRequest,
  GatheringComment,
  PageResponse,
  UserCar,
} from '@/types/gathering'

// ==================== 차량 정보 ====================

export const getMyCar = async (): Promise<UserCar | null> => {
  const res = await apiClient.get('/my/car')
  return res.data.data
}

export const saveMyCar = async (data: Omit<UserCar, 'id'>): Promise<UserCar> => {
  const res = await apiClient.put('/my/car', data)
  return res.data.data
}

// ==================== 벙 ====================

export const getGatherings = async (page = 0): Promise<PageResponse<GatheringSummary>> => {
  const res = await apiClient.get('/gatherings', { params: { page, size: 20 } })
  return res.data.data
}

export const getGathering = async (id: number): Promise<Gathering> => {
  const res = await apiClient.get(`/gatherings/${id}`)
  return res.data.data
}

export const createGathering = async (data: GatheringRequest): Promise<Gathering> => {
  const res = await apiClient.post('/gatherings', data)
  return res.data.data
}

export const updateGathering = async (id: number, data: GatheringRequest): Promise<Gathering> => {
  const res = await apiClient.put(`/gatherings/${id}`, data)
  return res.data.data
}

export const deleteGathering = async (id: number): Promise<void> => {
  await apiClient.delete(`/gatherings/${id}`)
}

export const closeGathering = async (id: number): Promise<Gathering> => {
  const res = await apiClient.patch(`/gatherings/${id}/close`)
  return res.data.data
}

// ==================== 참여 ====================

export const participate = async (id: number, data: GatheringParticipantRequest): Promise<Gathering> => {
  const res = await apiClient.post(`/gatherings/${id}/participate`, data)
  return res.data.data
}

// ==================== 찜하기 ====================

export const toggleBookmark = async (id: number): Promise<boolean> => {
  const res = await apiClient.post(`/gatherings/${id}/bookmark`)
  return res.data.data.isBookmarked
}

// ==================== 댓글 ====================

export const addComment = async (id: number, content: string): Promise<GatheringComment> => {
  const res = await apiClient.post(`/gatherings/${id}/comments`, { content })
  return res.data.data
}

export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/gatherings/comments/${commentId}`)
}

// ==================== 매너 온도 ====================

export const rateUser = async (gatheringId: number, ratedUserId: number, score: 1 | -1): Promise<void> => {
  await apiClient.post(`/gatherings/${gatheringId}/rate`, { ratedUserId, score })
}

// ==================== 히스토리/북마크 ====================

export const getMyGatheringHistory = async (): Promise<GatheringSummary[]> => {
  const res = await apiClient.get('/gatherings/my/history')
  return res.data.data
}

export const getMyBookmarks = async (): Promise<GatheringSummary[]> => {
  const res = await apiClient.get('/gatherings/my/bookmarks')
  return res.data.data
}
