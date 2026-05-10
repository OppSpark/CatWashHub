import apiClient from '@/api/axios'
import type { Post, PostSummary, Comment, PageResponse, PostRequest, CommentRequest } from '@/types/board'

// ==================== 게시글 ====================

export const getPosts = async (page = 0, size = 20): Promise<PageResponse<PostSummary>> => {
  const res = await apiClient.get('/posts', { params: { page, size } })
  return res.data.data
}

export const getPost = async (id: number): Promise<Post> => {
  const res = await apiClient.get(`/posts/${id}`)
  return res.data.data
}

export const createPost = async (data: PostRequest): Promise<Post> => {
  const res = await apiClient.post('/posts', data)
  return res.data.data
}

export const updatePost = async (id: number, data: PostRequest): Promise<Post> => {
  const res = await apiClient.patch(`/posts/${id}`, data)
  return res.data.data
}

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/posts/${id}`)
}

export const toggleLike = async (id: number): Promise<boolean> => {
  const res = await apiClient.post(`/posts/${id}/like`)
  return res.data.data
}

// ==================== 댓글 ====================

export const getComments = async (postId: number): Promise<Comment[]> => {
  const res = await apiClient.get(`/posts/${postId}/comments`)
  return res.data.data
}

export const createComment = async (postId: number, data: CommentRequest): Promise<Comment> => {
  const res = await apiClient.post(`/posts/${postId}/comments`, data)
  return res.data.data
}

export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/posts/comments/${commentId}`)
}
