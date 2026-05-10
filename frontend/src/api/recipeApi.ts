import apiClient from '@/api/axios'
import type { Recipe, RecipeStepDraft } from '@/types/recipe'

interface RecipeRequest {
  title: string
  description: string
  carModel: string
  estimatedMinutes: number | null
  visibility: string
  steps: RecipeStepDraft[]
}

interface PageResponse<T> {
  content: T[]
  last: boolean
  totalElements: number
}

export const getRecipes = async (
  page = 0, size = 20,
  keyword?: string, carModel?: string
): Promise<PageResponse<Recipe>> => {
  const res = await apiClient.get('/recipes', { params: { page, size, keyword, carModel } })
  return res.data.data
}

export const getTopRecipes = async (): Promise<Recipe[]> => {
  const res = await apiClient.get('/recipes/top')
  return res.data.data
}

export const getRecipe = async (id: number): Promise<Recipe> => {
  const res = await apiClient.get(`/recipes/${id}`)
  return res.data.data
}

export const getMyRecipes = async (): Promise<Recipe[]> => {
  const res = await apiClient.get('/recipes/my')
  return res.data.data
}

export const getSavedRecipes = async (): Promise<Recipe[]> => {
  const res = await apiClient.get('/recipes/saved')
  return res.data.data
}

export const createRecipe = async (data: RecipeRequest): Promise<Recipe> => {
  const res = await apiClient.post('/recipes', data)
  return res.data.data
}

export const updateRecipe = async (id: number, data: RecipeRequest): Promise<Recipe> => {
  const res = await apiClient.patch(`/recipes/${id}`, data)
  return res.data.data
}

export const deleteRecipe = async (id: number): Promise<void> => {
  await apiClient.delete(`/recipes/${id}`)
}

export const toggleSaveRecipe = async (id: number): Promise<boolean> => {
  const res = await apiClient.post(`/recipes/${id}/save`)
  return res.data.data
}
